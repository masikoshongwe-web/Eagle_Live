import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, LogOut } from 'lucide-react';
import { Room, RoomEvent, Track } from 'livekit-client';

const roomSlotForIdentity = (identity) => {
  if (identity === 'host-1') return 'host1';
  if (identity === 'host-2') return 'host2';
  return null;
};

function VideoTile({ track, label, name, points, side, accent }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const element = videoRef.current;
    if (!track || !element) return undefined;

    track.attach(element);
    return () => {
      track.detach(element);
    };
  }, [track]);

  return (
    <div className={`relative min-w-0 overflow-hidden bg-slate-900 ${side === 'left' ? 'border-r border-slate-800/80' : ''}`}>
      {track ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 h-full w-full object-cover"
          aria-label={`${name} live video`}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 px-3 text-center">
          <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full border text-xl ${accent}`}>
            {side === 'left' ? '🦅' : '🎧'}
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Live feed</span>
          <span className="mt-1 text-xs text-slate-500">Waiting for {name}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />
      <div className={`absolute bottom-3 z-10 ${side === 'right' ? 'right-3 text-right' : 'left-3'}`}>
        <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${label}`}>
          {side === 'left' ? 'HOST 1' : 'HOST 2'}
        </span>
        <p className="text-sm font-bold text-white drop-shadow">{name}</p>
        <p className={`text-[11px] font-medium ${accent.includes('blue') ? 'text-blue-300' : 'text-amber-300'}`}>
          {side === 'right' ? `${points.toLocaleString()} pts 🔥` : `🔥 ${points.toLocaleString()} pts`}
        </p>
      </div>
    </div>
  );
}

export default function LiveVideoPanel({
  host1Points,
  host2Points,
  host1Percent,
  host2Percent,
  pkTimeLeft,
  activeGiftOverlay,
}) {
  const [selectedRole, setSelectedRole] = useState('viewer');
  const [hostPasscode, setHostPasscode] = useState('');
  const [joinedRole, setJoinedRole] = useState(null);
  const [status, setStatus] = useState('offline');
  const [error, setError] = useState('');
  const [videoTracks, setVideoTracks] = useState({ host1: null, host2: null });
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const roomRef = useRef(null);
  const audioElementsRef = useRef(new Map());

  const clearAudioTrack = (track) => {
    const element = audioElementsRef.current.get(track);
    if (element) {
      track.detach(element);
      element.remove();
      audioElementsRef.current.delete(track);
    } else {
      track.detach().forEach((detachedElement) => detachedElement.remove());
    }
  };

  const clearRoomMedia = () => {
    for (const [track, element] of audioElementsRef.current.entries()) {
      track.detach(element);
      element.remove();
    }
    audioElementsRef.current.clear();
    setVideoTracks({ host1: null, host2: null });
    setCameraEnabled(false);
    setMicrophoneEnabled(false);
  };

  useEffect(() => () => {
    roomRef.current?.disconnect();
    for (const [track, element] of audioElementsRef.current.entries()) {
      track.detach(element);
      element.remove();
    }
    audioElementsRef.current.clear();
  }, []);

  const connectToRoom = async (event) => {
    event.preventDefault();
    if (status === 'connecting') return;

    setStatus('connecting');
    setError('');

    let room;
    try {
      const tokenResponse = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          hostPasscode: selectedRole === 'viewer' ? undefined : hostPasscode,
        }),
      });
      const tokenBody = await tokenResponse.json().catch(() => ({}));
      if (!tokenResponse.ok) {
        throw new Error(tokenBody.error || 'Could not get a live video connection.');
      }

      room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      const publishVideoTrack = (participant, track) => {
        const slot = roomSlotForIdentity(participant.identity);
        if (slot && track.kind === Track.Kind.Video) {
          setVideoTracks((current) => ({ ...current, [slot]: track }));
        }
      };

      const removeVideoTrack = (participant, track) => {
        const slot = roomSlotForIdentity(participant.identity);
        if (!slot || track.kind !== Track.Kind.Video) return;
        setVideoTracks((current) => (
          current[slot] === track ? { ...current, [slot]: null } : current
        ));
      };

      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === Track.Kind.Video) {
          publishVideoTrack(participant, track);
        } else if (track.kind === Track.Kind.Audio) {
          const audioElement = track.attach();
          audioElement.autoplay = true;
          audioElement.setAttribute('playsinline', '');
          audioElement.style.display = 'none';
          document.body.appendChild(audioElement);
          audioElementsRef.current.set(track, audioElement);
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
        removeVideoTrack(participant, track);
        if (track.kind === Track.Kind.Audio) clearAudioTrack(track);
      });

      room.on(RoomEvent.LocalTrackPublished, (publication, participant) => {
        if (publication.track) publishVideoTrack(participant, publication.track);
      });

      room.on(RoomEvent.LocalTrackUnpublished, (publication, participant) => {
        if (publication.track) removeVideoTrack(participant, publication.track);
      });

      room.on(RoomEvent.ParticipantDisconnected, (participant) => {
        const slot = roomSlotForIdentity(participant.identity);
        if (slot) setVideoTracks((current) => ({ ...current, [slot]: null }));
      });

      room.on(RoomEvent.Disconnected, () => {
        clearRoomMedia();
        setJoinedRole(null);
        setStatus('offline');
        roomRef.current = null;
      });

      await room.connect(tokenBody.server_url, tokenBody.participant_token);

      if (selectedRole !== 'viewer') {
        await room.localParticipant.setCameraEnabled(true);
        await room.localParticipant.setMicrophoneEnabled(true);
        setCameraEnabled(true);
        setMicrophoneEnabled(true);
      }

      setJoinedRole(selectedRole);
      setHostPasscode('');
      setStatus('connected');
    } catch (connectionError) {
      room?.disconnect();
      roomRef.current = null;
      clearRoomMedia();
      setJoinedRole(null);
      setStatus('offline');
      setError(connectionError.message || 'Live video could not connect. Check camera and microphone permissions.');
    }
  };

  const leaveRoom = async () => {
    setStatus('disconnecting');
    const room = roomRef.current;
    roomRef.current = null;
    if (room) await room.disconnect();
    clearRoomMedia();
    setJoinedRole(null);
    setStatus('offline');
  };

  const toggleCamera = async () => {
    const room = roomRef.current;
    if (!room) return;
    const nextEnabled = !cameraEnabled;
    try {
      await room.localParticipant.setCameraEnabled(nextEnabled);
      setCameraEnabled(nextEnabled);
    } catch (cameraError) {
      setError(cameraError.message || 'Could not change camera state.');
    }
  };

  const toggleMicrophone = async () => {
    const room = roomRef.current;
    if (!room) return;
    const nextEnabled = !microphoneEnabled;
    try {
      await room.localParticipant.setMicrophoneEnabled(nextEnabled);
      setMicrophoneEnabled(nextEnabled);
    } catch (microphoneError) {
      setError(microphoneError.message || 'Could not change microphone state.');
    }
  };

  const totalPoints = host1Points + host2Points;
  const isConnected = status === 'connected';
  const isHost = joinedRole === 'host-1' || joinedRole === 'host-2';

  return (
    <>
      <div className="relative aspect-[4/3] overflow-hidden border-b border-slate-800 bg-slate-900">
        <div className="absolute inset-0 grid grid-cols-2">
          <VideoTile
            track={videoTracks.host1}
            label="bg-red-600/90"
            name="Sarah Live"
            points={host1Points}
            side="left"
            accent="border-amber-400/30 bg-amber-400/10"
          />
          <VideoTile
            track={videoTracks.host2}
            label="bg-blue-600/90"
            name="DJ Eagle"
            points={host2Points}
            side="right"
            accent="border-blue-400/30 bg-blue-400/10"
          />
        </div>

        <div className="absolute left-1/2 top-3 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-amber-500/50 bg-slate-950/90 px-3 py-1 text-xs font-black text-amber-400 shadow-lg backdrop-blur">
          <span>⚔️ PK BATTLE</span>
          <span className="text-slate-500">|</span>
          <span className="font-mono text-red-400">{pkTimeLeft}</span>
        </div>

        {activeGiftOverlay && (
          <div className="pointer-events-none absolute inset-0 z-30 flex animate-gift-bounce flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="mb-2 text-6xl drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]">{activeGiftOverlay.icon}</div>
            <div className="rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 px-4 py-1.5 text-sm font-black uppercase tracking-wider text-slate-950 shadow-xl">
              {activeGiftOverlay.name} Blast!
            </div>
            <p className="mt-1 text-xs font-semibold text-white drop-shadow">
              {activeGiftOverlay.sender} gifted <span className="text-amber-300">{activeGiftOverlay.targetHost}</span>
            </p>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 z-20 flex h-3 border-t border-slate-800 bg-slate-950">
          <div
            className="flex h-full items-center justify-start bg-gradient-to-r from-red-600 to-amber-500 pl-1 transition-all duration-500"
            style={{ width: `${totalPoints > 0 ? host1Percent : 50}%` }}
          >
            <span className="text-[9px] font-black text-white">{host1Percent}%</span>
          </div>
          <div
            className="flex h-full items-center justify-end bg-gradient-to-r from-cyan-500 to-blue-600 pr-1 transition-all duration-500"
            style={{ width: `${totalPoints > 0 ? host2Percent : 50}%` }}
          >
            <span className="text-[9px] font-black text-white">{host2Percent}%</span>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-800 bg-slate-900 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Live video room</span>
          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${isConnected ? 'bg-red-500/15 text-red-300' : 'bg-slate-800 text-slate-400'}`}>
            <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-red-400' : 'bg-slate-500'}`} />
            {isConnected ? (isHost ? 'Broadcast connected' : 'Watching live room') : status === 'connecting' ? 'Connecting…' : 'Not connected'}
          </span>
        </div>

        {!isConnected ? (
          <form onSubmit={connectToRoom} className="space-y-2">
            <div className="flex gap-2">
              <select
                value={selectedRole}
                onChange={(event) => setSelectedRole(event.target.value)}
                disabled={status === 'connecting' || status === 'disconnecting'}
                className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                aria-label="Join as"
              >
                <option value="viewer">Viewer — watch the room</option>
                <option value="host-1">Host 1 — Sarah Live</option>
                <option value="host-2">Host 2 — DJ Eagle</option>
              </select>
              <button
                type="submit"
                disabled={status === 'connecting' || status === 'disconnecting'}
                className="shrink-0 rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-amber-400 disabled:cursor-wait disabled:opacity-60"
              >
                {status === 'connecting' ? 'Connecting…' : selectedRole === 'viewer' ? 'Join room' : 'Start broadcast'}
              </button>
            </div>
            {selectedRole !== 'viewer' && (
              <input
                type="password"
                value={hostPasscode}
                onChange={(event) => setHostPasscode(event.target.value)}
                autoComplete="current-password"
                placeholder="Host access passcode"
                aria-label="Host access passcode"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
              />
            )}
            <p className="text-[10px] text-slate-500">
              Hosts need camera and microphone permission plus the host passcode. Viewers join with listen-only access.
            </p>
          </form>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {isHost && (
              <>
                <button
                  type="button"
                  onClick={toggleCamera}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-amber-500/60"
                >
                  {cameraEnabled ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
                  {cameraEnabled ? 'Camera on' : 'Camera off'}
                </button>
                <button
                  type="button"
                  onClick={toggleMicrophone}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-amber-500/60"
                >
                  {microphoneEnabled ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                  {microphoneEnabled ? 'Mic on' : 'Mic off'}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={leaveRoom}
              className="ml-auto flex items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/25"
            >
              <LogOut className="h-3.5 w-3.5" />
              Leave room
            </button>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-200">
            {error}
          </p>
        )}
      </div>
    </>
  );
}
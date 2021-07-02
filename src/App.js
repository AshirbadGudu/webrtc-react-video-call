import { useEffect, useRef, useState } from "react";
import logo from "./logo.svg";
import "./App.css";

export default function App() {
  const isMounted = useRef(false);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const textAreaRef = useRef();
  const [peer, setPeer] = useState();
  useEffect(() => {
    isMounted.current = true;
    const PEER_CONNECTION_CONFIG = null;
    const pc = new RTCPeerConnection(PEER_CONNECTION_CONFIG);
    isMounted.current && setPeer(pc);
    return () => (isMounted.current = false);
  }, []);
  useEffect(() => {
    if (peer) {
      peer.onicecandidate = (e) => {
        if (e.candidate) {
          console.log(`ICE Candidate`, JSON.stringify(e.candidate));
        }
      };
      peer.oniceconnectionstatechange = (e) => {
        console.log(`ice connection state changed `, e);
      };

      peer.onaddstream = (e) => {
        remoteVideoRef.current.srcObject = e.stream;
      };
      getMediaOfDevice();
    }
    return () => {};
  }, [peer]);

  const getMediaOfDevice = async () => {
    try {
      const constraints = { video: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localVideoRef.current.srcObject = stream;
      peer.addStream(stream);
    } catch (error) {
      console.log(`Error`, error);
    }
  };
  const createOffer = async () => {
    try {
      console.log("Creating Offer SDP...");
      const sdp = await peer.createOffer({ offerToReceiveVideo: 1 });
      console.log(JSON.stringify(sdp));
      peer.setLocalDescription(sdp);
    } catch (error) {
      console.log(`Error`, error);
    }
  };
  const createAnswer = async () => {
    try {
      console.log("Creating Answer SDP...");
      const sdp = await peer.createAnswer({ offerToReceiveVideo: 1 });
      console.log(JSON.stringify(sdp));
      peer.setLocalDescription(sdp);
    } catch (error) {
      console.log(`Error`, error);
    }
  };

  const setRemoteDescription = () => {
    const remoteDesc = JSON.parse(textAreaRef.current.value);
    peer.setRemoteDescription(new RTCSessionDescription(remoteDesc));
  };
  const addCandidate = () => {
    const candidate = JSON.parse(textAreaRef.current.value);
    peer.addIceCandidate(new RTCIceCandidate(candidate));
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>React WebRTC</h1>
      </header>
      <main>
        <video controls autoPlay playsInline ref={localVideoRef}></video>
        <video controls autoPlay playsInline ref={remoteVideoRef}></video>
      </main>
      <footer>
        <textarea
          placeholder="Offer, Answer etc.."
          rows="10"
          ref={textAreaRef}
        ></textarea>
        <div>
          <button onClick={createOffer}>Create Offer</button>
          <button onClick={createAnswer}>Create Answer</button>
          <button onClick={setRemoteDescription}>Set Remote Description</button>
          <button onClick={addCandidate}>Add Candidate</button>
        </div>
      </footer>
    </div>
  );
}

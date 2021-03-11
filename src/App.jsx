import { useState } from 'react'
import * as Y from 'yjs'
import { useYDoc, useYArray } from 'zustand-yjs'
import { WebrtcProvider } from 'y-webrtc'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'

const connectDoc = doc => {
  const room = 'testyroom'
  const rtcProvider = new WebrtcProvider(
    room, doc, {
      peerOpts: {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
          ]
        }
      }
    }
  )
  const wsProvider = new WebsocketProvider(
    'ws://localhost:1234', room, doc, {}
  )
  const idbProvider = new IndexeddbPersistence(room, doc)
  return () => {
    rtcProvider.destroy()
    wsProvider.destroy()
    idbProvider.destroy()
  }
}

const Doc = () => {
  const yDoc = useYDoc('myDocGuid', connectDoc)
  const { data, push } = useYArray(yDoc.getArray('usernames'))
  return (
    <div>
      <button onClick={() => push([`username #${data.length}`])}>
        New Username
      </button>
      <ul>
        {data.map((username, index) => (
          <li key={index}>{username}</li>
        ))}
      </ul>
    </div>
  )
}

const App = () => {
  const [mounted, setMounted] = useState(true)
  return (
    <>
      <button children={
        mounted ? 'unmount' : 'mount'
      } onClick={
        event => setMounted(!mounted)
      } />
      {mounted && <Doc />}
    </>
  )
}

export default App

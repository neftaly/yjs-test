import { useState } from 'react'
import * as Y from 'yjs'
import { useYDoc, useYArray } from 'zustand-yjs'
import { WebrtcProvider } from 'y-webrtc'
import { IndexeddbPersistence } from 'y-indexeddb'

const connectDoc = ({ room, awareness, password }) => doc => {
  const idbProvider = new IndexeddbPersistence(`prob-y-${room}`, doc)
  const setLastAccess = () => idbProvider.set('lastAccess', new Date().valueOf())
  setLastAccess()
  idbProvider.set('room', room)
  const rtcProvider = new WebrtcProvider(
    room, doc, {
      awareness,
      password,
      filterBcConns: false, // TODO: dev only? allow video in multiple tabs
      maxConns: Infinity,
      peerOpts: {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
          ]
        }
      }
    }
  )
  return () => {
    setLastAccess()
    idbProvider.destroy()
    rtcProvider.destroy()
  }
}

const Doc = () => {
  const yDoc = useYDoc('myDocGuid', connectDoc({ room: 'testyroom'}))
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

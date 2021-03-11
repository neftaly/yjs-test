import { useState } from 'react'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { useYDoc, useYArray } from 'zustand-yjs'

const connectDoc = doc => {
  const provider = new WebrtcProvider('testyroom', doc, {
    peerOpts: {
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun.nextcloud.com:443' },
          { urls: 'stun:relay.webwormhole.io' }
        ]
      }
    }
  })
  return () => {
    console.log('disconnected') 
    provider.disconnect()
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

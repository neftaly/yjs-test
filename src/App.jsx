import { useState, useMemo } from 'react'
// import * as Y from 'yjs'
import {
  useYDoc,
  useYArray,
  useYAwareness
} from 'zustand-yjs'
import { WebrtcProvider } from 'y-webrtc'
import { IndexeddbPersistence } from 'y-indexeddb'

const connectDoc = ({ userId, awareness, password }) => (
  yDoc, 
  startAwareness
) => {
  console.log('connectdoc')
  const { guid } = yDoc
  const idbProvider = new IndexeddbPersistence(`prob-y-${guid}`, yDoc)
  const setLastAccess = () => idbProvider.set('lastAccess', new Date().valueOf())
  setLastAccess()
  const rtcProvider = new WebrtcProvider(
    guid, yDoc, {
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
  rtcProvider.awareness.setLocalState({
    userId,
    color: '#' + parseInt(Math.random() * 1000),
    index: null
  })
  const stopAwareness = startAwareness(rtcProvider)
  return () => {
    setLastAccess()
    stopAwareness()
    idbProvider.destroy()
    rtcProvider.destroy()
  }
}

const Activity = ({ awarenessData, index }) => {
  return (
    <span style={{ fontSize: '0.75em' }} children={
      awarenessData.filter(
        a => a.index === index
      ).map(
        ({ userId, color }, key) => (
          <span key={key} style={{ marginLeft: '0.5em', color }} children={userId} />
        )
      )
    } />
  )
}

const Doc = ({ yDoc }) => {
  const { data, push } = useYArray(yDoc.getArray('usernames'))
  const [awarenessData, setAwarenessData] = useYAwareness(yDoc)
  return (
    <div>
      <pre children={JSON.stringify(awarenessData, null, 2)} />
      <button onClick={() => push([`username #${data.length}`])}>
        New Username
      </button>
      <ul>
        {data.map((username, index) => (
          <li
            key={index}
            onClick={e => {
              if (awarenessData.length === 0) {
                console.log('not yet ready for awareness data')
              } else {
                setAwarenessData({ index })
              }
            }}
          >
            {username}
            <Activity awarenessData={awarenessData} index={index} />
          </li>
        ))}
      </ul>
    </div>
  )
}

const App = () => {
  const [mounted, setMounted] = useState(true)
  const userId = useMemo(() => new Date() * 1, [])
  const yDoc = useYDoc('testyroom', connectDoc({ userId }))
  return (
    <>
      <button children={
        mounted ? 'unmount' : 'mount'
      } onClick={
        event => setMounted(!mounted)
      } />
      {mounted && <Doc yDoc={yDoc} />}
    </>
  )
}

export default App

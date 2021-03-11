import { useMemo, useEffect } from 'react'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { useYDoc, useYArray } from 'zustand-yjs'

const connectDoc = doc => {
  const provider = new WebrtcProvider('testyroom', doc, {})
  return () => console.log('dc') || provider.disconnect()
}

const App = () => {
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

export default App

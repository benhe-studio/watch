import Face from './Face'
import Markers from './Markers'
import Hands from './Hands'

function WatchFace({ config }) {
  return (
    <group>
      {/* Watch face base */}
      <Face config={config.face} />

      {/* Markers */}
      <Markers markers={config.markers} />

      {/* Watch hands */}
      <Hands profile={config.hands.profile} />
    </group>
  )
}

export default WatchFace
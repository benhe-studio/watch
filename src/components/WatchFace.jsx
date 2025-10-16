import Face from './Face'
import Markers from './Markers'
import MinuteMarkers from './MinuteMarkers'
import Hands from './Hands'
import Complications from './Complications'

function WatchFace({ config }) {
  return (
    <group>
      {/* Watch face base */}
      <Face config={config.face} complications={config.complications} />

      {/* Markers */}
      <Markers markers={config.markers} />

      {/* Minute Markers */}
      <MinuteMarkers minuteMarkers={config.minuteMarkers} />

      {/* Complications */}
      <Complications complications={config.complications} />

      {/* Watch hands */}
      <Hands profile={config.hands.profile} />
    </group>
  )
}

export default WatchFace
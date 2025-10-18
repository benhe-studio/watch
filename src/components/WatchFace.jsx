import Face from './Face'
import Markers from './Markers'
import MinuteMarkers from './MinuteMarkers'
import Decorations from './Decorations'
import Hands from './Hands'
import Complications from './Complications'

function WatchFace({ config }) {
  return (
    <group>
      {/* Watch face base */}
      <Face config={config.face} complications={config.complications} />

      {/* Markers */}
      {config.markers && <Markers markers={config.markers} />}

      {/* Minute Markers */}
      {config.minuteMarkers && <MinuteMarkers minuteMarkers={config.minuteMarkers} />}

      {/* Decorations */}
      {config.decorations && <Decorations decorations={config.decorations} />}

      {/* Complications */}
      {config.complications && <Complications complications={config.complications} />}

      {/* Watch hands */}
      {config.hands && <Hands hands={config.hands} />}
    </group>
  )
}

export default WatchFace
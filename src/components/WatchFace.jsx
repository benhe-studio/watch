import Face from './Face'
import Bezel from './Bezel'
import Markers from './Markers'
import MinuteMarkers from './MinuteMarkers'
import Decorations from './Decorations'
import Hands from './Hands'
import ComplicationWindows from './ComplicationWindows'
import Primitives from './Primitives'

function WatchFace({ config }) {
  return (
    <group>
      {/* Watch face base */}
      <Face config={config.face} complicationWindows={config.complicationWindows} />

      {/* Bezel */}
      {config.bezel && <Bezel config={config.bezel} />}

      {/* Markers */}
      {config.markers && <Markers markers={config.markers} />}

      {/* Minute Markers */}
      {config.minuteMarkers && <MinuteMarkers minuteMarkers={config.minuteMarkers} />}

      {/* Decorations */}
      {config.decorations && <Decorations decorations={config.decorations} />}

      {/* Complication Windows (background visible through face cutouts) */}
      {config.complicationWindows && <ComplicationWindows windows={config.complicationWindows} />}

      {/* Primitives */}
      {config.primitives && <Primitives primitives={config.primitives} />}

      {/* Watch hands */}
      {config.hands && <Hands hands={config.hands} />}
    </group>
  )
}

export default WatchFace
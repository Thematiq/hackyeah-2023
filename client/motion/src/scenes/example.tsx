import alea from "alea";
import { makeScene2D, Img, Rect, Node, Txt } from "@motion-canvas/2d";
import {
  Reference,
  ReferenceReceiver,
  all,
  createRef,
  delay,
  easeOutElastic,
  makeRef,
  range,
  sequence,
} from "@motion-canvas/core";
import defaultHeaderPng from "../images/default-header.png";
import defaultBottomBar from "../images/default-bottom-bar.png";
import mapTerrainPng from "../images/map-terrain.png";
import animalBunchSvg from "../images/animal-bunch.svg";

function* popInFollowThrough(group: Node) {
  yield* sequence(0.2, group.scale(1, 1, easeOutElastic));
}

function makeBunch(
  ref: ReferenceReceiver<Node>,
  x: number,
  y: number,
  count: number
) {
  return (
    <Node ref={ref} x={x} y={y} scale={0}>
      <Node>
        <Img width={150} src={animalBunchSvg} scale={0.5 + count * 0.15} />
        <Txt fill="#ffffff" fontSize={80 * (0.5 + count * 0.15)}>
          {String(count)}
        </Txt>
      </Node>
    </Node>
  );
}

export default makeScene2D(function* (view) {
  const header = createRef<Img>();
  const mapAnchor = createRef<Img>();
  const mapTerrain = createRef<Img>();

  const bunches: Node[] = [];
  const builtInBunch = createRef<Node>();

  view.add(
    <Node>
      <Node ref={mapAnchor}>
        <Img
          ref={mapTerrain}
          src={mapTerrainPng}
          width={6200}
          position={{ x: 0, y: -400 }}
        />
        <Node>builtInBunch</Node>
      </Node>
      <Rect
        layout
        direction="column"
        justifyContent="space-between"
        height="100%"
      >
        <Img ref={header} src={defaultHeaderPng} />
        <Img src={defaultBottomBar} />
      </Rect>
    </Node>
  );

  const prng = alea("seed7");

  const animalIcons: Node[] = [];

  // Create some animal bunches
  mapAnchor().add(
    range(10).map((i) => {
      const x = (prng() - 0.5) * 2000;
      const y = (prng() - 0.5) * 2000;
      const count = 1 + Math.round(prng() * 6);

      return makeBunch(makeRef(bunches, i), x, y, count);
    })
  );

  yield* all(
    // header().position.x(300, 1).to(-300, 1),
    mapAnchor().position.x(500, 0).wait(0.5).to(-500, 2).wait(1),
    delay(1, sequence(0.1, ...bunches.map((b) => popInFollowThrough(b))))
    // header().fill("#e6a700", 1).to("#e13238", 1)
  );
});

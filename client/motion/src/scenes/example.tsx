import alea from "alea";
import { makeScene2D, Img, Rect, Node, Txt, Circle } from "@motion-canvas/2d";
import {
  ReferenceReceiver,
  all,
  createRef,
  delay,
  easeOutElastic,
  easeOutQuad,
  makeRef,
  range,
  sequence,
  waitFor,
} from "@motion-canvas/core";
import defaultHeaderPng from "../images/default-header.png";
import defaultBottomBar from "../images/default-bottom-bar.png";
import mapTerrainPng from "../images/map-terrain.png";
import animalBunchSvg from "../images/animal-bunch.svg";
import localizeButtonPng from "../images/localize-button.png";
import picturePopupPng from "../images/picture-popup.png";
import infoPanelPng from "../images/info-panel.png";

function* popInFollowThrough(group: Node) {
  yield* sequence(0.2, group.scale(1, 1, easeOutElastic));
}

function makeBunch(
  ref: ReferenceReceiver<Node>,
  anchorRef: Node,
  count: number
) {
  const el = (
    <Node ref={ref} scale={0}>
      <Node>
        <Img
          x={75}
          y={-75}
          width={150}
          src={animalBunchSvg}
          scale={0.5 + count * 0.15}
        />
        <Txt x={75} y={-75} fill="#ffffff" fontSize={80 * (0.5 + count * 0.15)}>
          {String(count)}
        </Txt>
      </Node>
    </Node>
  );

  // Binding bunch to its anchor
  el.absolutePosition(() => anchorRef.absolutePosition());

  return el;
}

export default makeScene2D(function* (view) {
  const header = createRef<Img>();
  const bunchContainer = createRef<Node>();
  const zoomAnchor = createRef<Node>();
  const mapAnchor = createRef<Node>();
  const mapTerrain = createRef<Img>();

  const bunches: Node[] = [];
  const bunchAnchors: Node[] = [];
  const builtInBunchAnchor = createRef<Node>();
  const builtInBunch = createRef<Node>();
  const picturePopup = createRef<Node>();
  const infoPopup = createRef<Node>();

  view.add(
    <Node>
      <Node ref={zoomAnchor} scale={1}>
        <Node ref={mapAnchor}>
          <Img
            ref={mapTerrain}
            src={mapTerrainPng}
            width={6200}
            position={[0, -400]}
          />
          <Node ref={builtInBunchAnchor} position={[800, 0]} />
        </Node>
      </Node>
      <Node ref={bunchContainer}>
        {makeBunch(builtInBunch, builtInBunchAnchor(), 0)}
      </Node>
      <Img y={-960} x={580} alignSelf="end" src={localizeButtonPng} />
      <Node ref={picturePopup} opacity={0}>
        <Img src={picturePopupPng} y={100} />
      </Node>
      <Node ref={infoPopup} opacity={0}>
        <Img src={infoPanelPng} y={100} />
      </Node>
      <Rect
        layout
        direction="column"
        justifyContent="space-between"
        height="100%"
      >
        <Rect direction="column">
          <Img ref={header} src={defaultHeaderPng} />
        </Rect>
        <Rect>
          <Img src={defaultBottomBar} />
        </Rect>
      </Rect>
    </Node>
  );

  let prng = alea("seed7");

  // Create some animal bunches
  range(10).forEach((i) => {
    const x = (prng() - 0.5) * 2000;
    const y = (prng() - 0.5) * 2000;
    const count = 1 + Math.round(prng() * 6);

    mapAnchor().add(<Node x={x} y={y} ref={makeRef(bunchAnchors, i)} />);

    bunchContainer().add(
      makeBunch(makeRef(bunches, i), bunchAnchors[i], count)
    );
  });

  prng = alea("see62");
  // Create animal icons
  const animalIcons: Node[] = [];
  bunchContainer().add(
    range(5).map((i) => {
      const x = builtInBunchAnchor().position.x() + (prng() - 0.5) * 150 - 30;
      const y = builtInBunchAnchor().position.y() + (prng() - 0.5) * 150 + 40;

      mapAnchor().add(
        <Circle
          ref={makeRef(animalIcons, i)}
          fill="#74C1A6"
          x={x}
          y={y}
          size={40}
          scale={0}
        />
      );
    })
  );

  yield* all(
    // header().position.x(300, 1).to(-300, 1),
    mapAnchor().position.x(500, 0).wait(0.5).to(-750, 2).wait(1),
    delay(1, sequence(0.1, ...bunches.map((b) => popInFollowThrough(b))))
    // header().fill("#e6a700", 1).to("#e13238", 1)
  );

  // Zoom In
  yield* all(
    zoomAnchor().scale(3, 1),
    delay(0.5, all(...bunches.map((a) => a.opacity(0, 0.2)))),
    delay(0.5, all(...animalIcons.map((a) => popInFollowThrough(a))))
  );

  yield* waitFor(0.5);

  // Open info popup
  yield* all(
    mapAnchor().position.y(330, 1),
    delay(
      0.7,
      all(
        picturePopup().opacity(1, 0.3, easeOutQuad),
        picturePopup().scale(0.8, 0).to(1, 0.3, easeOutQuad),
        picturePopup().position.y(300, 0).to(100, 0.3, easeOutQuad)
      )
    )
  );

  yield* waitFor(1);

  yield* all(
    picturePopup().opacity(0, 0.3),
    picturePopup().position.y(300, 0.3)
  );

  yield* all(
    infoPopup().opacity(1, 0.3),
    infoPopup().position.y(200, 0).to(0, 0.3)
  );

  yield* waitFor(1);
});

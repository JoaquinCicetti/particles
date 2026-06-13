import React from 'react';
import {
  buildCommonSVGStyles,
  ControlModuleState,
  DeviceState,
  getSingleLightAnimationFromDeviceState,
  getSingleLightAnimationFromModuleState,
  LightStatus,
} from './utils';

interface AnimatedGrowcastIndustryWithControlAndExpanderProps {
  state?: DeviceState;
  light?: LightStatus;
  controlModule1?: LightStatus;
  controlModule2?: LightStatus;

  // this is only to animate the state of the connected module
  moduleState?: ControlModuleState;
}

// get corresponding animation based on light and state. state overwrite led status
const getAnimation = (light?: LightStatus, state?: DeviceState) => {
  if (state !== undefined) {
    return getSingleLightAnimationFromDeviceState(state);
  }

  if (light === LightStatus.BLINKING) {
    return 'blink';
  }

  return undefined;
};

// get corresponding animation based on light and state. state overwrite led status
const getContolModuleAnimation = (light?: LightStatus, state?: ControlModuleState) => {
  if (state !== undefined) {
    return getSingleLightAnimationFromModuleState(state);
  }

  if (light === LightStatus.BLINKING) {
    return 'blink';
  }

  return undefined;
};

const AnimatedGrowcastIndustryWithControlAndExpander: React.FC<AnimatedGrowcastIndustryWithControlAndExpanderProps> = (props) => {
  const { light = LightStatus.OFF, controlModule1 = LightStatus.OFF, controlModule2 = LightStatus.OFF, state, moduleState } = props;

  const lightColor = 'hsl(var(--primary))';

  const animation = getAnimation(light, state);
  const lightFill = light === LightStatus.OFF && animation === undefined ? 'transparent' : lightColor;

  const controlModule1Animation = getContolModuleAnimation(controlModule1, moduleState);
  const controlModule1LightFill = controlModule1 === LightStatus.OFF && controlModule1Animation === undefined ? 'transparent' : lightColor;

  return (
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 535.62 663.24">
        <defs>
          <style>{buildCommonSVGStyles()}</style>
        </defs>

        <g className="isolated">
          <g id="Layer_2" data-name="Layer 2">
            <g id="Industrial">
              <g id="dispositivo">
                <g>
                  <g>
                    <g>
                      <rect className="line" x={178.07} y={184.75} width={31.11} height={28.69} />
                      <g>
                        <circle className="line" cx={205.05} cy={203.9} r={2.79} />
                        <circle className="line" cx={182.2} cy={203.9} r={2.79} />
                      </g>
                      <g>
                        <circle className="line" cx={179.01} cy={197.54} r={2.03} />
                        <circle className="line" cx={208.24} cy={197.54} r={2.03} />
                      </g>
                      <g>
                        <circle className="line" cx={181.25} cy={187.36} r={1.2} />
                        <circle className="line" cx={185.44} cy={187.36} r={1.2} />
                        <circle className="line" cx={201.81} cy={187.36} r={1.2} />
                        <circle className="line" cx={206} cy={187.36} r={1.2} />
                      </g>
                      <g>
                        <circle className="line" cx={187.28} cy={196.07} r={1.27} />
                        <circle className="line" cx={190.87} cy={196.07} r={1.27} />
                        <circle className="line" cx={194.45} cy={196.07} r={1.27} />
                        <circle className="line" cx={198.04} cy={196.07} r={1.27} />
                        <circle className="line" cx={189.21} cy={199.27} r={1.27} />
                        <circle className="line" cx={192.8} cy={199.27} r={1.27} />
                        <circle className="line" cx={196.38} cy={199.27} r={1.27} />
                        <circle className="line" cx={199.97} cy={199.27} r={1.27} />
                      </g>
                    </g>
                    <g>
                      <rect className="line" x={250.04} y={184.75} width={31.11} height={28.69} />
                      <g>
                        <circle className="line" cx={277.02} cy={203.9} r={2.79} />
                        <circle className="line" cx={254.17} cy={203.9} r={2.79} />
                      </g>
                      <g>
                        <circle className="line" cx={250.98} cy={197.54} r={2.03} />
                        <circle className="line" cx={280.21} cy={197.54} r={2.03} />
                      </g>
                      <g>
                        <circle className="line" cx={253.22} cy={187.36} r={1.2} />
                        <circle className="line" cx={257.41} cy={187.36} r={1.2} />
                        <circle className="line" cx={273.78} cy={187.36} r={1.2} />
                        <circle className="line" cx={277.97} cy={187.36} r={1.2} />
                      </g>
                      <g>
                        <circle className="line" cx={259.25} cy={196.07} r={1.27} />
                        <circle className="line" cx={262.84} cy={196.07} r={1.27} />
                        <circle className="line" cx={266.42} cy={196.07} r={1.27} />
                        <circle className="line" cx={270.01} cy={196.07} r={1.27} />
                        <circle className="line" cx={261.18} cy={199.27} r={1.27} />
                        <circle className="line" cx={264.77} cy={199.27} r={1.27} />
                        <circle className="line" cx={268.35} cy={199.27} r={1.27} />
                        <circle className="line" cx={271.94} cy={199.27} r={1.27} />
                      </g>
                    </g>
                    <g>
                      <rect className="line" x={133.52} y={160.25} width={12.91} height={20.17} />
                      <rect className="line" x={137.56} y={149.32} width={4.84} height={5.6} />
                      <rect className="line" x={136.15} y={141.11} width={7.67} height={5.69} />
                      <rect className="line" x={136.64} y={187.96} width={6.68} height={5.25} />
                      <rect className="line" x={136.03} y={193.74} width={7.89} height={5.87} />
                    </g>
                    <g>
                      <path
                        className="line"
                        d="M139.88,147.39c-6.11,0-11.39,2.46-14,6.07v27.89a12.53,12.53,0,0,0,2.4,2.43v6.51h23.27v-6.51a12.25,12.25,0,0,0,2.4-2.43V153.46C151.26,149.85,146,147.39,139.88,147.39Z"
                      />
                      <path
                        className="line"
                        d="M146.24,151.11v-6.64H133.55v6.64A20.26,20.26,0,0,0,122,160.89v18.73a20.27,20.27,0,0,0,11.55,9.79v6.64h12.69v-6.64a20.24,20.24,0,0,0,11.55-9.79V160.89A20.22,20.22,0,0,0,146.24,151.11Z"
                      />
                      <line className="line" x1={130.05} y1={193.72} x2={130.05} y2={197.4} />
                      <line className="line" x1={130.05} y1={143.46} x2={130.05} y2={147.14} />
                      <line className="line" x1={128.21} y1={195.56} x2={131.89} y2={195.56} />
                    </g>
                    <g>
                      <rect
                        className="line"
                        x={463.87}
                        y={150.52}
                        width={1.73}
                        height={3.8}
                        transform="translate(312.31 617.15) rotate(-90)"
                      />
                      <rect
                        className="line"
                        x={463.87}
                        y={148.25}
                        width={1.73}
                        height={3.8}
                        transform="translate(314.59 614.88) rotate(-90)"
                      />
                      <rect
                        className="line"
                        x={463.87}
                        y={145.98}
                        width={1.73}
                        height={3.8}
                        transform="translate(316.86 612.61) rotate(-90)"
                      />
                      <rect
                        className="line"
                        x={463.87}
                        y={143.71}
                        width={1.73}
                        height={3.8}
                        transform="translate(319.13 610.34) rotate(-90)"
                      />
                      <rect
                        className="line"
                        x={463.87}
                        y={141.43}
                        width={1.73}
                        height={3.8}
                        transform="translate(321.4 608.06) rotate(-90)"
                      />
                      <rect
                        className="line"
                        x={463.87}
                        y={139.16}
                        width={1.73}
                        height={3.8}
                        transform="translate(323.67 605.79) rotate(-90)"
                      />
                      <rect
                        className="line"
                        x={463.87}
                        y={136.89}
                        width={1.73}
                        height={3.8}
                        transform="translate(325.94 603.52) rotate(-90)"
                      />
                      <rect
                        className="line"
                        x={463.87}
                        y={134.62}
                        width={1.73}
                        height={3.8}
                        transform="translate(328.21 601.25) rotate(-90)"
                      />
                      <rect
                        className="line"
                        x={463.87}
                        y={132.35}
                        width={1.73}
                        height={3.8}
                        transform="translate(330.49 598.98) rotate(-90)"
                      />
                      <rect
                        className="line"
                        x={463.87}
                        y={130.08}
                        width={1.73}
                        height={3.8}
                        transform="translate(332.76 596.71) rotate(-90)"
                      />
                    </g>
                    <rect className="line" x={464.75} y={125.63} width={35.15} height={33.13} />
                    <rect className="line" x={479.17} y={137.7} width={8.94} height={9} />
                    <g>
                      <g>
                        <rect className="line" x={466.67} y={156.38} width={1.73} height={3.8} />
                        <rect className="line" x={468.95} y={156.38} width={1.73} height={3.8} />
                        <rect className="line" x={471.22} y={156.38} width={1.73} height={3.8} />
                        <rect className="line" x={473.49} y={156.38} width={1.73} height={3.8} />
                        <rect className="line" x={475.76} y={156.38} width={1.73} height={3.8} />
                        <rect className="line" x={478.03} y={156.38} width={1.73} height={3.8} />
                        <rect className="line" x={480.3} y={156.38} width={1.73} height={3.8} />
                        <rect className="line" x={482.57} y={156.38} width={1.73} height={3.8} />
                        <rect className="line" x={484.85} y={156.38} width={1.73} height={3.8} />
                        <rect className="line" x={487.12} y={156.38} width={1.73} height={3.8} />
                        <rect className="line" x={489.39} y={156.38} width={1.73} height={3.8} />
                        <rect className="line" x={491.66} y={156.38} width={1.73} height={3.8} />
                        <rect className="line" x={493.93} y={156.38} width={1.73} height={3.8} />
                        <rect className="line" x={496.2} y={156.38} width={1.73} height={3.8} />
                      </g>
                      <g>
                        <rect className="line" x={466.67} y={124.22} width={1.73} height={3.8} />
                        <rect className="line" x={468.95} y={124.22} width={1.73} height={3.8} />
                        <rect className="line" x={471.22} y={124.22} width={1.73} height={3.8} />
                        <rect className="line" x={473.49} y={124.22} width={1.73} height={3.8} />
                        <rect className="line" x={475.76} y={124.22} width={1.73} height={3.8} />
                        <rect className="line" x={478.03} y={124.22} width={1.73} height={3.8} />
                        <rect className="line" x={480.3} y={124.22} width={1.73} height={3.8} />
                        <rect className="line" x={482.57} y={124.22} width={1.73} height={3.8} />
                        <rect className="line" x={484.85} y={124.22} width={1.73} height={3.8} />
                        <rect className="line" x={487.12} y={124.22} width={1.73} height={3.8} />
                        <rect className="line" x={489.39} y={124.22} width={1.73} height={3.8} />
                        <rect className="line" x={491.66} y={124.22} width={1.73} height={3.8} />
                        <rect className="line" x={493.93} y={124.22} width={1.73} height={3.8} />
                        <rect className="line" x={496.2} y={124.22} width={1.73} height={3.8} />
                      </g>
                    </g>
                    <rect className="line" x={83.16} y={20.95} width={432} height={189.44} rx={9.59} />
                    <g>
                      <circle className="line" cx={90.78} cy={28.72} r={3.45} />
                      <circle className="line" cx={90.78} cy={94.23} r={3.45} />
                      <circle className="line" cx={90.78} cy={202.75} r={3.45} />
                      <circle className="line" cx={507.54} cy={28.72} r={3.45} />
                      <circle className="line" cx={507.54} cy={94.23} r={3.45} />
                      <circle className="line" cx={507.54} cy={202.75} r={3.45} />
                    </g>
                    <path
                      className="line"
                      d="M464.13,62.92l-10.8-6.33a6.29,6.29,0,0,1,4.83-2.28,6.39,6.39,0,0,1,6.33,6.43,6.06,6.06,0,0,1-.09,1l2,1.21A8.68,8.68,0,0,0,458.16,52a8.53,8.53,0,0,0-6.8,3.4l-1.58-.93V52.75A8.7,8.7,0,0,0,455.61,39l-.32-.44-.46.28-.92.55-.88.54h0l-3.26,2V35.5l-.55,0h-.51c-.21,0-.42,0-.62,0h0l-.54,0V50.45a6.45,6.45,0,0,1-1.13-12.29V35.78a8.7,8.7,0,0,0,1.13,17v1.74l-1.51.89a8.51,8.51,0,0,0-14.29,1.24l-.26.48.46.3.07,0h0l.5.32,4.51,2.9-3.79,2.23h0l-.5.29-.93.54-.47.28.24.49a8.81,8.81,0,0,0,.56,1l.31.48.78-.46.28-.17.17-.1.46-.27.74-.43.07,0h0l0,0h0l10.26-6a6.51,6.51,0,0,1,.41,2.27,6.39,6.39,0,0,1-6.33,6.43,6.26,6.26,0,0,1-4.07-1.52l-2,1.19a8.53,8.53,0,0,0,6.09,2.59,8.69,8.69,0,0,0,7.88-12.11l1.47-.87,1.61.95a8.71,8.71,0,0,0,7.92,12h.37l.58,0v-.68h0v-.6L459,62.55l4,2.34h0l.56.32.92.54L465,66l.31-.46a7.41,7.41,0,0,0,.58-1l.24-.48h0ZM449.78,44.67l4.81-2.92a6.45,6.45,0,0,1-4.81,8.71ZM439.3,59.32l-4.63-3a6.18,6.18,0,0,1,4.61-2,6.32,6.32,0,0,1,4.77,2.21Zm12.53,1.42a6.45,6.45,0,0,1,.38-2.18l4.42,2.59.09,5.84A6.41,6.41,0,0,1,451.83,60.74Z"
                    />
                  </g>
                  <g>
                    <g>
                      <circle className="line" cx={415.2} cy={315.15} r={3.18} />
                      <circle className="line" cx={415.2} cy={358.91} r={3.18} />
                    </g>
                    <rect
                      id="_Rectangle_"
                      data-name="&lt;Rectangle&gt;"
                      className="line"
                      x={371.32}
                      y={248.52}
                      width={43.87}
                      height={176.88}
                    />
                    <g>
                      <circle className="line" cx={386.27} cy={253.94} r={4.37} />
                      <circle className="line" cx={396.22} cy={248.66} r={3.18} />
                      <circle className="line" cx={386.27} cy={420.28} r={4.37} />
                      <circle className="line" cx={396.22} cy={425.41} r={3.18} />
                    </g>
                    <g>
                      <g>
                        <circle className="line" cx={412.17} cy={252.37} r={1.87} />
                        <circle className="line" cx={412.17} cy={258.93} r={1.87} />
                        <circle className="line" cx={412.17} cy={284.58} r={1.87} />
                        <circle className="line" cx={412.17} cy={291.14} r={1.87} />
                      </g>
                      <g>
                        <circle className="line" cx={412.17} cy={295.89} r={1.87} />
                        <circle className="line" cx={412.17} cy={302.45} r={1.87} />
                        <circle className="line" cx={412.17} cy={328.1} r={1.87} />
                        <circle className="line" cx={412.17} cy={334.66} r={1.87} />
                      </g>
                      <g>
                        <circle className="line" cx={412.17} cy={339.41} r={1.87} />
                        <circle className="line" cx={412.17} cy={345.96} r={1.87} />
                        <circle className="line" cx={412.17} cy={371.62} r={1.87} />
                        <circle className="line" cx={412.17} cy={378.17} r={1.87} />
                      </g>
                      <g>
                        <circle className="line" cx={412.17} cy={382.92} r={1.87} />
                        <circle className="line" cx={412.17} cy={389.48} r={1.87} />
                        <circle className="line" cx={412.17} cy={415.13} r={1.87} />
                        <circle className="line" cx={412.17} cy={421.69} r={1.87} />
                      </g>
                    </g>
                    <g>
                      <g>
                        <circle className="line" cx={398.52} cy={261.82} r={1.99} />
                        <circle className="line" cx={398.52} cy={267.44} r={1.99} />
                        <circle className="line" cx={398.52} cy={273.06} r={1.99} />
                        <circle className="line" cx={398.52} cy={278.67} r={1.99} />
                        <circle className="line" cx={393.51} cy={264.84} r={1.99} />
                        <circle className="line" cx={393.51} cy={270.46} r={1.99} />
                        <circle className="line" cx={393.51} cy={276.08} r={1.99} />
                        <circle className="line" cx={393.51} cy={281.69} r={1.99} />
                      </g>
                      <g>
                        <circle className="line" cx={398.52} cy={305.34} r={1.99} />
                        <circle className="line" cx={398.52} cy={310.95} r={1.99} />
                        <circle className="line" cx={398.52} cy={316.57} r={1.99} />
                        <circle className="line" cx={398.52} cy={322.19} r={1.99} />
                        <circle className="line" cx={393.51} cy={308.36} r={1.99} />
                        <circle className="line" cx={393.51} cy={313.97} r={1.99} />
                        <circle className="line" cx={393.51} cy={319.59} r={1.99} />
                        <circle className="line" cx={393.51} cy={325.21} r={1.99} />
                      </g>
                      <g>
                        <circle className="line" cx={398.52} cy={348.85} r={1.99} />
                        <circle className="line" cx={398.52} cy={354.47} r={1.99} />
                        <circle className="line" cx={398.52} cy={360.09} r={1.99} />
                        <circle className="line" cx={398.52} cy={365.71} r={1.99} />
                        <circle className="line" cx={393.51} cy={351.87} r={1.99} />
                        <circle className="line" cx={393.51} cy={357.49} r={1.99} />
                        <circle className="line" cx={393.51} cy={363.11} r={1.99} />
                        <circle className="line" cx={393.51} cy={368.73} r={1.99} />
                      </g>
                      <g>
                        <circle className="line" cx={398.52} cy={392.37} r={1.99} />
                        <circle className="line" cx={398.52} cy={397.99} r={1.99} />
                        <circle className="line" cx={398.52} cy={403.61} r={1.99} />
                        <circle className="line" cx={398.52} cy={409.22} r={1.99} />
                        <circle className="line" cx={393.51} cy={395.39} r={1.99} />
                        <circle className="line" cx={393.51} cy={401.01} r={1.99} />
                        <circle className="line" cx={393.51} cy={406.62} r={1.99} />
                        <circle className="line" cx={393.51} cy={412.24} r={1.99} />
                      </g>
                    </g>
                    <rect className="line" x={377.11} y={219.6} width={139.4} height={235.63} rx={8.32} />
                    <g>
                      <circle className="line" cx={505.24} cy={230.41} r={5.38} />
                      <circle className="line" cx={446.78} cy={230.41} r={5.38} />
                      <circle className="line" cx={388.32} cy={230.41} r={5.38} />
                    </g>
                    <g>
                      <circle className="line" cx={505.24} cy={444.05} r={5.38} />
                      <circle className="line" cx={446.78} cy={444.05} r={5.38} />
                      <circle className="line" cx={388.32} cy={444.05} r={5.38} />
                    </g>
                    <path
                      className="line"
                      d="M482.18,416.59l6.33-10.8a6.29,6.29,0,0,1,2.29,4.83,6.39,6.39,0,0,1-6.43,6.33,6.18,6.18,0,0,1-1-.09l-1.21,2a8.68,8.68,0,0,0,10.94-8.28,8.56,8.56,0,0,0-3.39-6.8l.93-1.58h1.75a8.71,8.71,0,0,0,13.77,5.83l.44-.32-.28-.46-.56-.92-.53-.88h0l-2-3.26h6.4l0-.55v-.12c0-.12,0-.25,0-.39s0-.42,0-.62v0l0-.54H494.66a6.44,6.44,0,0,1,12.28-1.13h2.39a8.7,8.7,0,0,0-17,1.13h-1.74l-.89-1.51a8.51,8.51,0,0,0-1.25-14.29l-.48-.26-.29.46-.05.07h0l-.31.5-2.9,4.51-2.23-3.79h0l-.3-.5-.54-.93-.27-.46-.5.23a9.05,9.05,0,0,0-1,.57l-.47.3.46.78.16.28.1.17.27.46.44.74,0,.07h0v0h0l6,10.26a6.43,6.43,0,0,1-8.69-5.92,6.16,6.16,0,0,1,1.52-4.06l-1.2-2a8.53,8.53,0,0,0-2.59,6.09,8.65,8.65,0,0,0,8.7,8.58,8.75,8.75,0,0,0,3.42-.7l.86,1.47-.95,1.61a8.71,8.71,0,0,0-12,7.92c0,.1,0,.19,0,.29V411l0,.58H477l5.56-.08-2.34,4h0l-.32.56-.54.92-.29.49.47.3a7.94,7.94,0,0,0,1,.58l.49.24h0Zm18.25-14.35,2.92,4.81a6.45,6.45,0,0,1-8.71-4.81Zm-14.64-10.48,3-4.63a6.22,6.22,0,0,1,2,4.61,6.3,6.3,0,0,1-2.22,4.77Zm-1.42,12.53a6.5,6.5,0,0,1,2.18.38L484,409.09l-5.85.09A6.42,6.42,0,0,1,484.37,404.29Z"
                    />
                  </g>
                  <g>
                    <g>
                      <g>
                        <rect
                          className="line"
                          x={164.17}
                          y={389.62}
                          width={35.28}
                          height={32.54}
                          transform="translate(-224.08 587.7) rotate(-90)"
                        />
                        <g>
                          <circle className="line" cx={187.26} cy={392.94} r={3.16} />
                          <circle className="line" cx={187.26} cy={418.85} r={3.16} />
                        </g>
                        <g>
                          <circle className="line" cx={180.05} cy={422.47} r={2.3} />
                          <circle className="line" cx={180.05} cy={389.32} r={2.3} />
                        </g>
                        <g>
                          <circle className="line" cx={168.51} cy={419.93} r={1.36} />
                          <circle className="line" cx={168.51} cy={415.18} r={1.36} />
                          <circle className="line" cx={168.51} cy={396.61} r={1.36} />
                          <circle className="line" cx={168.51} cy={391.86} r={1.36} />
                        </g>
                        <g>
                          <circle className="line" cx={178.39} cy={413.09} r={1.44} />
                          <circle className="line" cx={178.39} cy={409.02} r={1.44} />
                          <circle className="line" cx={178.39} cy={404.95} r={1.44} />
                          <circle className="line" cx={178.39} cy={400.89} r={1.44} />
                          <circle className="line" cx={182.01} cy={410.9} r={1.44} />
                          <circle className="line" cx={182.01} cy={406.83} r={1.44} />
                          <circle className="line" cx={182.01} cy={402.77} r={1.44} />
                          <circle className="line" cx={182.01} cy={398.7} r={1.44} />
                        </g>
                      </g>
                      <g>
                        <rect
                          className="line"
                          x={162.9}
                          y={463.17}
                          width={11.41}
                          height={11.41}
                          transform="translate(-300.27 637.48) rotate(-90)"
                        />
                        <g>
                          <rect
                            className="line"
                            x={155.84}
                            y={468.2}
                            width={11.41}
                            height={1.35}
                            transform="translate(-307.33 630.41) rotate(-90)"
                          />
                          <rect
                            className="line"
                            x={169.96}
                            y={468.2}
                            width={11.41}
                            height={1.35}
                            transform="translate(-293.21 644.54) rotate(-90)"
                          />
                        </g>
                        <g>
                          <rect
                            className="line"
                            x={162.9}
                            y={475.26}
                            width={11.41}
                            height={1.35}
                            transform="translate(337.2 951.87) rotate(180)"
                          />
                          <rect
                            className="line"
                            x={162.9}
                            y={461.14}
                            width={11.41}
                            height={1.35}
                            transform="translate(337.2 923.62) rotate(180)"
                          />
                        </g>
                        <polyline className="line" points="162.9 477.29 160.19 477.29 160.19 474.58" />
                        <polyline className="line" points="160.19 463.17 160.19 460.45 162.9 460.45" />
                        <polyline className="line" points="177.03 474.58 177.03 477.29 174.32 477.29" />
                        <polyline className="line" points="178.53 460.7 178.53 457.99 181.24 457.99" />
                        <polyline className="line" points="174.32 460.45 177.03 460.45 177.03 463.17" />
                        <g>
                          <rect
                            className="line"
                            x={173.27}
                            y={468.72}
                            width={16.2}
                            height={5.71}
                            transform="translate(-290.21 652.94) rotate(-90)"
                          />
                          <g>
                            <circle className="line" cx={181.45} cy={476.89} r={1.81} />
                            <circle className="line" cx={181.45} cy={471.57} r={1.81} />
                            <circle className="line" cx={181.45} cy={466.25} r={1.81} />
                          </g>
                        </g>
                        <rect
                          className="line"
                          x={179.68}
                          y={459.19}
                          width={3.36}
                          height={3.36}
                          transform="translate(-279.5 642.23) rotate(-90)"
                        />
                      </g>
                      <rect
                        id="_Rectangle_2"
                        data-name="&lt;Rectangle&gt;"
                        className="line"
                        x={19.17}
                        y={331.2}
                        width={176.7}
                        height={311.09}
                        rx={5.37}
                      />
                      <path
                        className="line"
                        d="M181.58,602.75l-4.76,8.12a4.73,4.73,0,0,1-1.71-3.63,4.81,4.81,0,0,1,4.83-4.76,5.26,5.26,0,0,1,.78.07l.91-1.53a6.51,6.51,0,0,0-8.22,6.22,6.4,6.4,0,0,0,2.55,5.11l-.7,1.19h-1.32a6.54,6.54,0,0,0-10.34-4.39l-.34.24.22.35.41.69.41.67h0l1.48,2.44H161l0,.42v.09c0,.09,0,.19,0,.29s0,.31,0,.46v0l0,.41h11.23a4.84,4.84,0,0,1-9.23.85h-1.8a6.54,6.54,0,0,0,12.75-.85h1.31l.66,1.13a6.4,6.4,0,0,0,.94,10.74l.36.2.22-.35,0-.06h0l.24-.37,2.18-3.39,1.67,2.85h0l.23.38.4.69.21.35.37-.17a7.9,7.9,0,0,0,.76-.43l.36-.23-.35-.59-.12-.2-.08-.13-.2-.35-.33-.56,0,0h0L178.24,617a5,5,0,0,1,1.7-.31,4.81,4.81,0,0,1,4.83,4.76,4.67,4.67,0,0,1-1.14,3.05l.9,1.52a6.4,6.4,0,0,0,1.94-4.57,6.52,6.52,0,0,0-9.1-5.92l-.65-1.11.72-1.21a6.53,6.53,0,0,0,9-6v-.71h-1l-4.18.07,1.76-3h0l.24-.42.4-.69.22-.36-.35-.24a6.4,6.4,0,0,0-.76-.43l-.37-.18h0Zm-13.71,10.79-2.2-3.62a5,5,0,0,1,1.79-.34,4.83,4.83,0,0,1,4.76,4Zm11,7.87-2.23,3.48a4.66,4.66,0,0,1-1.53-3.46,4.73,4.73,0,0,1,1.66-3.59Zm1.07-9.41a4.84,4.84,0,0,1-1.64-.29l1.95-3.32,4.39-.07A4.82,4.82,0,0,1,179.94,612Z"
                      />
                      <g>
                        <g>
                          <circle className="line" cx={26.58} cy={633.68} r={3.95} />
                          <circle className="line" cx={151.04} cy={633.68} r={3.95} />
                        </g>
                        <g>
                          <circle className="line" cx={60.66} cy={339.82} r={3.95} />
                          <circle className="line" cx={121.03} cy={339.82} r={3.95} />
                        </g>
                      </g>
                    </g>
                    <g>
                      <g>
                        <rect
                          className="line"
                          x={262.42}
                          y={463.38}
                          width={35.28}
                          height={32.54}
                          transform="translate(560.11 959.29) rotate(180)"
                        />
                        <g>
                          <circle className="line" cx={267.1} cy={474.2} r={3.16} />
                          <circle className="line" cx={293.02} cy={474.2} r={3.16} />
                        </g>
                        <g>
                          <circle className="line" cx={296.63} cy={481.41} r={2.3} />
                          <circle className="line" cx={263.48} cy={481.41} r={2.3} />
                        </g>
                        <g>
                          <circle className="line" cx={294.09} cy={492.95} r={1.36} />
                          <circle className="line" cx={289.34} cy={492.95} r={1.36} />
                          <circle className="line" cx={270.77} cy={492.95} r={1.36} />
                          <circle className="line" cx={266.02} cy={492.95} r={1.36} />
                        </g>
                        <g>
                          <circle className="line" cx={287.25} cy={483.07} r={1.44} />
                          <circle className="line" cx={283.18} cy={483.07} r={1.44} />
                          <circle className="line" cx={279.12} cy={483.07} r={1.44} />
                          <circle className="line" cx={275.05} cy={483.07} r={1.44} />
                          <circle className="line" cx={285.06} cy={479.44} r={1.44} />
                          <circle className="line" cx={281} cy={479.44} r={1.44} />
                          <circle className="line" cx={276.93} cy={479.44} r={1.44} />
                          <circle className="line" cx={272.86} cy={479.44} r={1.44} />
                        </g>
                      </g>
                      <g>
                        <rect
                          className="line"
                          x={337.33}
                          y={487.15}
                          width={11.41}
                          height={11.41}
                          transform="translate(686.07 985.71) rotate(180)"
                        />
                        <g>
                          <rect
                            className="line"
                            x={337.33}
                            y={499.24}
                            width={11.41}
                            height={1.35}
                            transform="translate(686.07 999.83) rotate(180)"
                          />
                          <rect
                            className="line"
                            x={337.33}
                            y={485.12}
                            width={11.41}
                            height={1.35}
                            transform="translate(686.07 971.59) rotate(180)"
                          />
                        </g>
                        <g>
                          <rect
                            className="line"
                            x={344.39}
                            y={492.18}
                            width={11.41}
                            height={1.35}
                            transform="translate(842.95 142.76) rotate(90)"
                          />
                          <rect
                            className="line"
                            x={330.27}
                            y={492.18}
                            width={11.41}
                            height={1.35}
                            transform="translate(828.83 156.88) rotate(90)"
                          />
                        </g>
                        <polyline className="line" points="351.45 498.56 351.45 501.27 348.74 501.27" />
                        <polyline className="line" points="337.33 501.27 334.62 501.27 334.62 498.56" />
                        <polyline className="line" points="348.74 484.42 351.45 484.42 351.45 487.14" />
                        <polyline className="line" points="334.86 482.93 332.15 482.93 332.15 480.22" />
                        <polyline className="line" points="334.62 487.14 334.62 484.42 337.33 484.42" />
                        <g>
                          <rect
                            className="line"
                            x={337.64}
                            y={477.24}
                            width={16.2}
                            height={5.71}
                            transform="translate(691.48 960.19) rotate(180)"
                          />
                          <g>
                            <circle className="line" cx={351.06} cy={480} r={1.81} />
                            <circle className="line" cx={345.74} cy={480} r={1.81} />
                            <circle className="line" cx={340.42} cy={480} r={1.81} />
                          </g>
                        </g>
                        <rect
                          className="line"
                          x={333.35}
                          y={478.41}
                          width={3.36}
                          height={3.36}
                          transform="translate(670.06 960.19) rotate(180)"
                        />
                      </g>
                      <rect
                        className="line"
                        x={205.38}
                        y={465.59}
                        width={311.07}
                        height={176.7}
                        rx={5.37}
                        transform="translate(721.83 1107.88) rotate(180)"
                      />
                      <path
                        className="line"
                        d="M476.92,479.87l8.11,4.76a4.7,4.7,0,0,1-3.63,1.72,4.8,4.8,0,0,1-4.75-4.83,5.12,5.12,0,0,1,.06-.78l-1.53-.91a6.54,6.54,0,0,0,6.22,8.22,6.43,6.43,0,0,0,5.11-2.55l1.19.7v1.32a6.53,6.53,0,0,0-4.38,10.34l.24.33.35-.21.69-.42.66-.4h0l2.44-1.48v4.8l.42,0h.38l.47,0h0l.41,0V489.25a4.84,4.84,0,0,1,.85,9.23v1.79a6.54,6.54,0,0,0-.85-12.74v-1.31l1.14-.67a6.4,6.4,0,0,0,10.74-.93l.19-.36-.35-.23-.05,0h0l-.37-.24-3.4-2.18,2.85-1.68h0l.38-.22.69-.4.36-.21-.18-.37a5.56,5.56,0,0,0-.43-.76l-.23-.36-.58.35L500,478l-.13.08-.35.2-.55.33-.05,0h0l-7.71,4.53a5,5,0,0,1-.3-1.7,4.79,4.79,0,0,1,4.75-4.83,4.62,4.62,0,0,1,3.05,1.14l1.53-.9a6.43,6.43,0,0,0-4.58-1.95,6.53,6.53,0,0,0-5.92,9.11l-1.1.64-1.22-.71a6.53,6.53,0,0,0-6-9h-.28l-.43,0v.52h0V476l.06,4.18-3-1.76h0l-.41-.24-.7-.41-.36-.21-.23.35a6.49,6.49,0,0,0-.44.76l-.18.37h0Zm10.78,13.72-3.61,2.19a4.75,4.75,0,0,1-.34-1.79,4.82,4.82,0,0,1,3.95-4.75Zm7.88-11,3.48,2.24a4.68,4.68,0,0,1-3.47,1.53,4.74,4.74,0,0,1-3.58-1.67Zm-9.42-1.06a4.84,4.84,0,0,1-.29,1.64l-3.32-2-.06-4.39A4.81,4.81,0,0,1,486.16,481.52Z"
                      />
                      <g>
                        <g>
                          <circle className="line" cx={507.84} cy={634.87} r={3.95} />
                          <circle className="line" cx={507.84} cy={510.42} r={3.95} />
                        </g>
                        <g>
                          <circle className="line" cx={213.99} cy={600.8} r={3.95} />
                          <circle className="line" cx={213.99} cy={540.43} r={3.95} />
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
                <rect className="line" x={3.49} y={4.24} width={528.63} height={654.76} rx={19.83} />
                <rect className="line" x={0.38} y={0.38} width={534.87} height={662.49} rx={21.27} />
                <g>
                  <rect className="line" x={309.94} y={489.84} width={3.6} height={4.76} />
                  <rect className="line" x={315.98} y={489.84} width={3.6} height={4.76} />
                </g>
                <g>
                  <rect
                    className="line"
                    x={454.48}
                    y={135.57}
                    width={3.6}
                    height={4.76}
                    transform="translate(912.56 275.9) rotate(180)"
                  />
                  <rect
                    className="line"
                    x={448.44}
                    y={135.57}
                    width={3.6}
                    height={4.76}
                    transform="translate(900.48 275.9) rotate(180)"
                  />
                </g>
                <g>
                  <rect
                    className="line"
                    x={167.44}
                    y={435.18}
                    width={3.6}
                    height={4.76}
                    transform="translate(606.8 268.32) rotate(90)"
                  />
                  <rect
                    className="line"
                    x={167.44}
                    y={441.22}
                    width={3.6}
                    height={4.76}
                    transform="translate(612.84 274.37) rotate(90)"
                  />
                </g>
              </g>
              <g id="luzMain" className={animation}>
                {light !== LightStatus.OFF && (
                  <image
                    className="mixBlendModeScreen"
                    width={166}
                    height={146}
                    x={433.27 / 0.24}
                    y={120.35 / 0.24}
                    transform="scale(0.24)"
                    xlinkHref="data:image/png;base64,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"
                  />
                )}
                <g>
                  <rect x={451.48} y={132.57} width={2} height={2} fill={lightFill} />
                  <rect x={445.44} y={132.57} width={2} height={2} fill={lightFill} />
                </g>
              </g>
              <g id="luzSalida1" className={controlModule1Animation}>
                {controlModule1 !== LightStatus.OFF && (
                  <image
                    className="mixBlendModeScreen"
                    width={146}
                    height={166}
                    x={151.75 / 0.24}
                    y={420.59 / 0.24}
                    transform="scale(0.24)"
                    xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJIAAACmCAYAAAAxkNY1AAAACXBIWXMAAC4jAAAuIwF4pT92AAAOkUlEQVR4Xu2dXY4juw1GP19kIUGesv/V5CnISuI8TGTQbP6LUpXdOoAhiaLKZek0yz1zMffxfD5xOMzyl5dwOEQ4Ih1aOCIdWjgiHVo4Ih1aOCIdWjgiHVo4Ih1aOCIdWjgiHVo4Ih1aOCIdWvibl/Cb+Nd//vHwcgb//Pu/z992Ex6/7W//M7JU+Y2SfbVIO6SJ8u1yfZVIdxLH49vE+niRPkkejW+Q6mNF+gaBOJ8s1EeJ9I3yaHyaVB8h0iaBKu+xfPM+Rajbi7RAou7rSbRu6ifIdFuRGgXqus4MLZt8Z6FuKVKDRLPrVzK14XeV6VYiTQp01dqZDSyvvZtQtxGpKNGuNVkqm5pecyeZLhdpg0CZ3FVkNjmTC+AeQl0qUkGiaH40j1JZU9m86JpoHoDrZbpMpEUSdeXMEtnUrpwXV8p0iUhJibzc2XlOJD+7aV7+7PyLq2TaLtImibx1QCwnS2QztRxvrTf/4gqZtorUKFFFoK73zmyYlVsRKvzeu2XaJlJCIi9Pml8tVpSKBFLcOxRvHsBembaI1CRRh0CR+4jkRDYtI44Wr4j5xi6Z7vQf/3dIFI1Z8QjaWnpoNEeK8wN+BGORue0sr0jBapQ57O5YZE4jWzG6Y1b8xY6qtFSkDRJ15WTmvQ2LSNCV48VfrJbp6kdbVKKIDNmxFvPwHmvSI40/zqTHG39URXK8+DaWVaSJauQJ0D3WYlEilWP1WIu9sbIqLRFpk0TVOWnsxSWijxlrXJ2TxlrsjVUyXfVo65SoI09CmpcePXyexumYPtZo35rj72eNtdgW2itSoBqtkijbl8YzRKvLTD8y1mIvVlSlVpECEgG+SFmJvHmrL40rdEnkzUfmtNgb3TLtfrTtkMhbw/vSOMMT7+vp2OuPw3wYMd735rTYUtoqUqAaeRLxcVSSmZg2zhCpFt0x3pfGWuxFZ1XaXZEsZiTKzvG+NI4QrUZ8XqtOo4UT4/3L2SWSdEiRA7bWRVsvpo27kITic5pMg4hM3rqltDzaCo81axwRodpqMWkcQXu8SI+g2daLRcdvdD3edlQk74C8Q/bkkNrMdfh8J1o1siqR1sKJaXjzLUxXpMlq5PUzbSRHagfe55DwKlKkjeRIbbQvjd/oqEqrK1LlcLyDj0oUWUep3GsFXm2kWKTNUFmTYrVIHHpYUr/SevJ41xisFomKI8Ui8lhSaf0tTD3anMeaNGfJI8U8ISJ9KzbQPgeNaxslPVJo68UyuVLrxSjqYc8+3nZWJO/gLImknJk+bXlfiz0w/1M+qkikz6uL1lKkdVvYKZKEdIDSPD90SxZPnohI2n1lDofKEcnhfcCWhuLNL6f8aEs+1rRDkw6atxlpoutAWquvoT1C6CMm2vfGUt9qrb40fjHzeLuyImkHFjloaVyRira8b/HAz6qR4Yn396LX4mPe196vch9tXCnSwDrQjEBSzJOKtrzfjSePFLMk8sTaygqR+GFkDkqTKSOQJ9FOkSR5+HtEhZIk0rByvbUlSt+RGr4fWa3Vt2KZfBgthcakjXoa7VMZa7FovtS3Wt6Xxi+q35NWVCQNSz4+z/t8rSSKNafFpHYgjSub/MTPa9HrROZG7KH0Jbz5VrpF8g4jmiPFM/JEJLJEsu7JOxxNHO2aGamk9+ZxKS+SM0W3SBmiklmHar20HAh92vJ+F5ZMNIcz1ngitMuRIf2/Ig38bX8F7xAj0mTXaK+/Juetl0R2DY1p1yxTPd9dFcnaRK2f+UDeYdDrSWOpnSFSfQbRKjKul/m+pMXb6RSJb5z10xTdZE+MzEu6Hox2loxMESJCDHFGK81p4yk6RapCN5se8AwZibpEin7Jnj28cT2vGm3lDiJJWEJxIaRXZA2EPs3XyFYaqTJ4RL9034YdIllCRHI8SSieYJZEkfuRoGJlJLOEkK7hfQeifS1nGanf2qrf6P/Pg7XafJSIZNp8Rq5KjjTHidy/hZb/YG2ayjmvqkjRG+F53obOHow0z/s8f2BVm8h3IWmtlaNVkZFT+eIczUvTJVJUnCiSFNp7RKWJSmS9z4D+ZvRgMQtNHOs7EadThDaxukSawdt8DUkgSzoe14QaYw0uDJcJwnjA1/F45VDbZJjhKpGq8gC2QFJME0iSyJNJq0CSXMDPa3jyzAgFXCjVapGiwkTyIgJJ4vC4lA+hleDiWNVoIIlC4zNCRcWJ5pVZLdIgekjSvBX3xt41NYms++QSadVooM3xw5UOWxPKE43f33JSv/5v4sFeWk5mbJGRiM5H8ynefVqf19uTS9lVkSSqG+JtvjTWXnyNFKPQxxH/ibc+T6YS8XGU6roWVlSkqiAdeFJxNJm8ygDIazWy97WSJe8dFqnyp50LsA6kelhW3oO8rJwIK+59GdnzDov0YUQqCo/Tlve1Oe1a1vt/JVeLlNnY2Z9aLkKlynhrLBE9Zj5fJncJV4vUhXeAV220dy9X3Vc73yLS4WKOSIcWvkUk+ucn0p+lXPXnK969XHVf7VwtUmYjeW5mLfDzAK312py3ZkaSmc+XyV3C1SKtwhLBqhKWCNKcdq2KiB9NWKTqPy7QTORwtbFGpMp4ORFW3PsysucdFilB6gaayR6IVmWsihKpXpzsfa1kyXtf+Ze2T9T+HIWvi4w1Rt5Y82QxDU0m7UXJjqNU17WwoiLNYh0CzcmMLbgU3tpsPsW7T+vzentyKbsq0hM/f+KlHAjzVjxaibRrjjl+f95hSTJph6zNeeMRy8TpPG2Xs1okSxxKJE8Sisc0efiG8nxJIul+6HW4RDRuyaPlS3kekRwgnldmtUgaEXE0IkLR2ECTjcvE+xxNAkuSqCxRgTRm1k5xlUiUqlSePN4jUpNm5tFG56VrZKSKUl3XSpdIVRk0tM2xHjfW9yAJqQJJUg2kwx8t72svjiVQ9BoztF2vSyROVCyep0nB56UcaVO8HKv6SHN0/BTaiDTRHA1pPipENC9N6tf/7J92MvjGa/NRsgfDJZDmpH4lR5rjRO7fQst/sjZN5ZxXVSTKE/oj6SH0eQ7HqnTRDYh+sZbgsozWkisrTTRfuhcrZxk7RKpAD1mbs/AeaRYRsZ5Cq4nE8QSzhPDu6zLuINIT8m9SM/ANl+SICKMhiTRaLkREkgz8Oh3XnKZTJCqENKYxaU6ic5NmxOFEROLj2VcEfj/SnDaeolMkC00cGud9ICYbEN+ULpn4gXFxaN97ReH5Wp+Suf4Uqd/agNo3+gDeplQOw1ujvf47OW+9JLJraEy7Zpnq+e6qSBJP6I8+OoaQR+c0uqoPRzpI2vK+FfOkoWt4TMq7jG6RJBEisniPvTGmWHM0R1rnbbp1T9JYEyoiEcWbk4jkRXKm6BbJQjscaZ73gbpUEXEk+P1aB2SJxMdZeWhM60t4862U/sd/gPmPDPA4HUt92kb7VkyKa2Pa8r6HdKgRkfjYEy7ap63Vl8YA6t+PgDUV6YmfP8kPoS8h5Y4PR+MDKTbiPK+8SQrSQVkHLo35NbQY8DNuYeV6a0usECkLFUaSiMsSFWqFPJSsSLSfEWiMaavFLuNKkagkUlwSa/QhjEcsu7Ha+1hIB0r7nki0HxGI9rXPl/3crZS/IwHuP8bE56TvIlbsYcS0HGtOi/G+NKbwDYuIJMWignnXHFgxbfxi5vsRcG1FAv58MO/QHnjPGx/4ofQ1IjkD7b6k9dZherJY/TGmrYY3v5ydInEZ+EFxaTSJNIGyYnnwe9SulxFJilm5fJ3UUqR1W5h6tAEtjzfar7Ra34rRdmB9Dg2+edahezFPGK+1+tL4xexjDdhbkYA/H4ZXF9qvtGD9gRTrRjssq43GMq3V38JqkagsUSLyWDLtEGhQEYm3kRypzVBZk2L60QakH288JvWtWKTNXIfPZ4iKxGOeJNHr8BjvWzEAPY81YH1FAv58COuQ6PzoW7FIy1lVpTyRpFi19WIa3nwLLRUJWFKVtH629WLaOIImEu13SFXpWzEAfdUI2FORgD8fhh8UjUX6fJ3USqyqRkBMJNrPyEXxrsv7VmwJu0SK4MlkxcaGWWJJedJclohM3THev5y2RxvgPt4A+fERfdxEH1XeGt6XxhkiImn9aIz3vTkt9qLzsQbsr0ijWmgxPq/Njb4WQ7AvjStED9nre/OROS22lNaKBLRUJW/c1ZfGM0QPe6YfGWuxF93VCFggEnCpTNU8CWne26yKTNU8aazFXqyQCNj/aBs88fOgeMwa8z4Cc3QD+ZjGB96Ga/PeYUdFyVzHim1hSUUCQlUJmK9MHWMtFiVyoKvHWuyNVdUIWCgSEJJJm68cfnasxapEDjc7juZYcQBrJQKue7QNntC/i0iPGe/RR3O0sRajWIJ5B1KVoZLjxbextCIBoaoExCvTilhkTsPavKgIMzEr/mJ1NQI2iARMy6TNzcSs+AyZw56JReYA7JEIuP7RRuGPKm9Oi4HFpUcaj1MigkUOJyOVFp+SaCdbKhIQrkqAf5BdVcd7nwqVg88KFJkHsK8aARtFAlIyATUJKmskrNzMhnWJFZl7Y6dEwGaRgFaZrHlvHRDLyRLZzIpAkfkXuyUCLhAJ2CZTdJ4Tyc9umpc/O//iComAi0QC0jIBsQPuypklsqldOS+ukgi4UCRgmUxAPI9SWVPZvOiaaB6AayUCLhYJKMkE5A49k7uKzCZncgFcLxFwA5EGG4QaVNZkqWxqes0dBBrcRiSgLNPgqrUzG1heeyeJgJuJNJgUCpgTYzVTG343gQa3FAlokWnQdZ0ZWjb5rhIBNxZp0CjUoPt6Eq2bemeBBrcXCVgik0TlPZZv3idIBHyISINNQt2CTxFo8FEiUb5Rqk+Th/KxIg2+QahPFmjw8SJRPkmqb5CH8lUice4k1reJw/lqkSR2yPXt0kj8OpEsMpL9RlksjkiHFtL/K9LDQeKIdGjhiHRo4Yh0aOGIdGjhiHRo4Yh0aOGIdGjhiHRo4Yh0aOGIdGjhf0Y1Jxon4+rkAAAAAElFTkSuQmCC"
                  />
                )}
                <g>
                  <rect x={163.86} y={432.76} width={2} height={2} fill={controlModule1LightFill} />
                  <rect x={163.86} y={438.8} width={2} height={2} fill={controlModule1LightFill} />
                </g>
              </g>
              <g id="luzSalida2" className={controlModule2 === LightStatus.BLINKING ? 'blink' : undefined}>
                {controlModule2 !== LightStatus.OFF && (
                  <image
                    className="mixBlendModeScreen"
                    width={166}
                    height={145}
                    x={294.79 / 0.24}
                    y={474.83 / 0.24}
                    transform="scale(0.24)"
                    xlinkHref="data:image/png;base64,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"
                  />
                )}
                <g>
                  <rect
                    x={306.94}
                    y={486.84}
                    width={2}
                    height={2}
                    fill={controlModule2 === LightStatus.OFF ? 'transparent' : lightColor}
                  />
                  <rect
                    x={312.98}
                    y={486.84}
                    width={2}
                    height={2}
                    fill={controlModule2 === LightStatus.OFF ? 'transparent' : lightColor}
                  />
                </g>
              </g>
              <g id="flechas">
                {/* port 2 device circle  */}
                <g className="mixBlendModeMultiply">
                  <g>
                    <path className="color" d="M232.43,199.21c.09.16.38.17.45-.21l-.39-.41Z" />
                    <path
                      className="color"
                      d="M234.11,197c-.05-.49-.24-1.14-.78-1,.28.6,0,.62.41,1.28-.06.39-.36.59-.51.47.08.17-.29.54-.06.83a1.68,1.68,0,0,0,.64-1.68C234,196.8,234,197,234.11,197Z"
                    />
                    <path className="color" d="M262.53,175.48l-.24,0A.69.69,0,0,0,262.53,175.48Z" />
                    <path className="color" d="M284.73,174.27c-.17,0-.25,0-.26,0C284.63,174.32,284.76,174.33,284.73,174.27Z" />
                    <path className="color" d="M288.24,175.82l-.2-.1C288.11,175.79,288.18,175.84,288.24,175.82Z" />
                    <path className="color" d="M262.53,175.48l.62,0C263.14,175.26,262.82,175.41,262.53,175.48Z" />
                    <path className="color" d="M235.3,191.8a1.31,1.31,0,0,0-.08.36c0-.1.08-.2.13-.3S235.31,191.83,235.3,191.8Z" />
                    <path className="color" d="M253.48,179.78l-.17.08a1.84,1.84,0,0,0-.05.25Z" />
                    <path
                      className="color"
                      d="M246.85,183.54c.15-.08,0-.46-.07-.66a.56.56,0,0,1-.16.46A.78.78,0,0,0,246.85,183.54Z"
                    />
                    <path className="color" d="M237.67,191.22l-.06.22Z" />
                    <path className="color" d="M258.53,177.57a.42.42,0,0,0,.13.11A.24.24,0,0,0,258.53,177.57Z" />
                    <path className="color" d="M271.5,173.51s0,.05,0,.08S271.56,173.52,271.5,173.51Z" />
                    <path className="color" d="M279.91,177.84l-.13,0a2.12,2.12,0,0,0-.11.21Z" />
                    <path className="color" d="M294.34,179.05l0,0C294.13,179,294.22,179,294.34,179.05Z" />
                    <path className="color" d="M280.34,220.78c.8.19-1,.76.13.9C280.33,221.54,281.28,220.79,280.34,220.78Z" />
                    <path className="color" d="M235.45,191.65c.06-.09.11-.19.18-.28A1.54,1.54,0,0,0,235.45,191.65Z" />
                    <path className="color" d="M280.47,221.68Z" />
                    <path className="color" d="M305.71,189a.46.46,0,0,0,.1-.21S305.74,188.83,305.71,189Z" />
                    <path className="color" d="M298.27,180.37l.22.21A1,1,0,0,0,298.27,180.37Z" />
                    <path
                      className="color"
                      d="M307.67,194.37a.58.58,0,0,0,0,.42.18.18,0,0,0,.05-.07C307.62,194.65,307.6,194.55,307.67,194.37Z"
                    />
                    <path className="color" d="M306.77,200.54a.87.87,0,0,0,.11-.09l0-.2Z" />
                    <path className="color" d="M250.83,177.11a1.52,1.52,0,0,1,.44.23C251.05,177.11,252,176.62,250.83,177.11Z" />
                    <path className="color" d="M235.5,191.92a.27.27,0,0,1-.05-.27,2,2,0,0,1-.1.21A.13.13,0,0,0,235.5,191.92Z" />
                    <path className="color" d="M311,194.57l-.07,1.19A10.31,10.31,0,0,0,311,194.57Z" />
                    <path className="color" d="M236.78,218.27l-.22-.15A.4.4,0,0,0,236.78,218.27Z" />
                    <path
                      className="color"
                      d="M310.53,199.2a2.27,2.27,0,0,0-.42.57.41.41,0,0,0,.07.15C310.3,199.68,310.43,199.45,310.53,199.2Z"
                    />
                    <path className="color" d="M251.27,177.35h0Z" />
                    <path
                      className="color"
                      d="M257.82,174.13c-1,.26-.34.65-.48,1-1.15.48-.66-.24-1.15-.4-.71.37-1.12,1-1.67,1.19-.07-.07-.19-.07-.1-.22-.64.67-2.3.83-3,1.71a.38.38,0,0,1-.17-.08,1.15,1.15,0,0,1,.42.65c-.42.18-.64.64-.94.38.26-.1.22-.25.3-.4l-.38.33c-.61-.3.53-.43.39-.78a12.25,12.25,0,0,1-2.34,1.57c-.38-.39,1.46-.89.38-.88l1.11-.3c-1.12-.38.66-.22-.42-.69-1.45.51-1.43.94-2.84,1.53-.16.41.3.32.14.72a1.83,1.83,0,0,1-1.76.63,1.07,1.07,0,0,0-1.32.59c-.15.53.1,1.12-1,1.53l-.05-.69c-1.2.87-.15,1.15-1.56,1.85.05-.35.75-.89.54-.8-1.06.31-.33.7-.89,1.22l-.46-.27a29.36,29.36,0,0,0-3,4.11c-.06-.17,0-.5-.38-.27-1.12,1.9-2.62,3.87-3.78,5.7l.09.92c-.08.17-.33.25-.32,0-.48.7.24.14.24.57s-.45.49-.47.16a20.9,20.9,0,0,1-1.26,5.54l-.07-.32c-.41,1.14.64,1.46.09,2.48l-.05-.22c-.53,2.54-.2,5.29-.41,7.5.35.14.43.82.62,1.48s.52,1.28.94,1.14a12.39,12.39,0,0,1,.28,1.42,5.36,5.36,0,0,0,.74,1.73c.3.49.94.34,1.47.79l-.34.32,1,.38c0,.26,0,.5,0,.75l.56.37c-.17-.2-.26-.53-.13-.6.84.58,1.62,1.9,1.5,2.1.7.44,1.46.76,2.18,1.13-.14.12-.51-.06-.84-.15,1.33.35-.1.57,1.15.84-.08-.17.22-.19.3-.25a3.45,3.45,0,0,0,1,.87,10.5,10.5,0,0,0,1.45.68l-.31.2a27.85,27.85,0,0,0,5.41,2c-.64-.36-.31-.83.25-.72l.08.54c.43-.18-.52-.35.3-.48.69.24.33.66-.12.7l.9.07c0,.15-.2.17-.31.34.43-.2,1.4.87,2,.45l0,.15a33.5,33.5,0,0,0,4.42.53c.08-.41.68-.23,1.18-.54a17.67,17.67,0,0,0,3.8.66c1-.19.29-.35.74-.59.06.39,1.45.37.73.64a20.73,20.73,0,0,0,4.22-.5c-.24-.15-.5-.21-.37-.34.37-.08.87.1.83.29l-.1.05c2.28-.7,5.54.61,7.3-.5l-.1.06,1.85-.74c.89-.09-.48.37.22.49,1.93-1,3.28-.57,4.86-1.41,1.6.79,4.56-1.34,6.49-1.3l-.18-.21c.35-.41.58,0,.93-.12-.12-.17-.56,0-.34-.28,3.61-1.71,7.78-3,11.34-5.38,1.29-.9-.14-1.57,1.71-2.36l-.09.73c.48-.64,1-1.18,1.57-1.78s1.07-1.17,1.61-1.74,1-1.24,1.47-1.87a12.72,12.72,0,0,0,1.13-2c0,.21.12.3,0,.55.71-.33,1.23-2.08,1-2.22.25-.4.28,0,.56-.16.51-.49.27-1.69.74-1.85.08,0,0,.21,0,.33a8.5,8.5,0,0,1,.35-1c.11-.38.16-.67-.1-.55a5.37,5.37,0,0,0,.54-1.56,4.53,4.53,0,0,1,.43-1.42c-.3-.68.58-1.93,0-2.21.66.19.79-2,.41-2.75.21.25.22-.66.5-.37,0-.88-.26-1.69-.58-1.49a3,3,0,0,0-.31-2.28c-.34-.66-.59-1.21-.28-1.81a23.48,23.48,0,0,0-4.36-5.63c.59-.42,1.6,1.85,2.1,1.37-1.53-1.6-2.78-2-4.18-3.54-.34-.42.42,0,.64,0-1.73-1.2-3.1-2.59-4.84-3.26,0-.05.24,0,.42.06-.31-.18-.65-.54-.78-.25l.34.11c.24.67-1.68.06-1.85.24,1-.47-1.42-1.06-.05-1.56-.23-.06-.56-.08-.61.13-.27-.22-.32-.38.11-.42-1.21-.45-1,0-2-.47.07-.14.3-.09.49-.19a3.59,3.59,0,0,1-2.13-.51c.1-.06,0-.21.31-.09-1.56-.67-2.91-.42-4.53-1.27.72-.45-.52-.39-.45-1l-1-.14.31.38c-.83-.28-1.68,0-2.34-.39l.67-.07c-.53-.09-1.06-.21-1.6-.26a9.37,9.37,0,0,1,.85.4c-.91.08-.06.69-1.14.32.24,0-.82-.16-1.21-.56h0a2.45,2.45,0,0,1-1.5,0c-.14-.2.21-.6.12-.73-.24.21-.74.17-1.26.15a2.29,2.29,0,0,0-1.33.23.42.42,0,0,0,.16-.46l-.37.36c-.39-.15-.45-.22-.37-.45-1.19-.11.35.71-1.05.38.11,0,.06-.09.29-.14-1.42-.21-2.74.24-4,.11-.43-.54,1.13-.18.66-.64a20.76,20.76,0,0,0-2.86.59,17.17,17.17,0,0,1-2.78.61H269c-.09.83-1.4-.13-2.22.43.2-.11.19-.49.15-.4a15.72,15.72,0,0,0-4.17,1.6l.17-.26a18.94,18.94,0,0,0-2.65.71c-.15.27-.58.42-.22.59-2.73-.17-4,2.38-6.33,2.39.23-.12.48-.42.3-.34l-1.58,1c.28.25.31.09.77.16a2,2,0,0,1-.92.85c.64-.56-.25-.5-.65-.51.1.07,0,.23.12.31-1.13-.11.17.7-1.17.92l0-.2c-.39.3-.67.74-1.15.94-.38-.24.36-.41.24-.72-.64.39-.91,1.36-1.68,1.36.21-.27.6-.48.82-.73a1.93,1.93,0,0,0-1.39.31l.05,0-1.19.48.34-.06c-.24,1.35-1.5,1.2-2.13,2.47.61-1.23-.06-.42-.25-.85-.33.09-.81.28-.77.09-.26.66-1,.37-1.32,1.34-.13-.09-.5.41-.64,0-.53.6.31.07.38.25-.29.6-.95.9-1.58,1.38a3.8,3.8,0,0,0-1.65,1.87c-.8,1.31-.53,1.86-1.14,3.08-.47.23-.21-.61-.21-.61a3,3,0,0,0-1.12,1.67c0-.19-.21-.12-.46,0-.26.51.23.58-.3,1.13a2,2,0,0,1-.24-.79c-.22.67-.26,1.39-.47,2.06-.31.06-.15-.54-.19-.84a13.27,13.27,0,0,0-.41,1.3,1.49,1.49,0,0,0,0,1l.32-.4c-.09.27-.37,0-.36-.23,0-.76.54-.82.68-.79l-.14.48c1-.06.73-1.82,1.32-2.65l.32.67.09-1.12c.25-.1.62,0,.45.42.62-.41.13-.64.74-1,.08,0,.09,0,.07.08l.25-.64c0,.18.43.17.11.44,1-.74.78-1.84,1.46-1.87l0,.1c.93-1.39-.25-.41.19-1.74.47,0,.95.12,1.41.18l-.21-.43c.14-.11.41-.33.49-.15.24-.68-.22-.07-.16-.54.87-.29,1.62-1.68,2.22-1.25,0-.46-.78.31-.25-.46.69.46.74-.73,1.57-.9.05.47-.65.72.17.56,0-.85,1.29-.72,1.73-1.18-.28-.49,1-.94,1.88-1.65,0,.19,1.91-.74,2.89-1l0,.1c-.08-.57.88-1,1.51-1.39.12.31.06.48-.24.79l.63-.31c.07-.23.23-.41.62-.66l0,.44c.83-.43,1.51-1.24,2.73-1.49-.09-.38-1.32-.58-.24-1.35.12.17.31.48,0,.69.09-.07.29-.31.53-.32l-.33.53c.57-.09.15-.39.57-.54.11.28.38.06.42.3-.09.07-.4,0-.51.22a2.41,2.41,0,0,1,1.37-.11c-.1-.14-.16-.37.16-.55.86-.38.44.21,1,.14.13-.27.76-.3.61-.72.26-.1.38.07.52.14.38-.36,2.1-.81,1.43-1.07h-.13l.07-.05h0c1.37-.95,3.23-.76,4.71-1.3l0,.14a17.5,17.5,0,0,0,2.63-1c.28,0,.7.17.61.37a2.88,2.88,0,0,1,1.81-.28c-.69.33.27.18-.71.27.94,0,1.16.25,2.12-.25-.31.4.72.41,1.15.29l-.66-.24a6.37,6.37,0,0,1,1.37,0l-.22.5c1.84.53,3.42-1,4.79.1.53-.31-1-.31-.53-.69.88.11,1.69,1,1.95,1,1.12.41,1.2-.59,2.39-.17-.12-.2-.19-.7.78-.69.86.24.89,1,.33,1-.21,0-.3-.11-.27-.17-.29,0-.67,0-.37.27l.14-.15c.39.25,1.54.54,1.2.75.67,0,.34-.22-.11-.42,1,.5,1.68.44,2.71.95-.14-.15-.24-.4-.07-.34,1.53.71.81-.08,1.92.23.51.48-.45.52.71.71.57.44-.05.49-.35.53,1.08.07,1.66,1,2.16,1.27l-.55-.09a2.48,2.48,0,0,1,.82.28l-.13-.46c.26.2.51.32.44.45.4-.06,0-.64.77-.63.31.35,1.26.44,1.18.92-1.13-.77-.09.49-1.14,0a1.84,1.84,0,0,1,.71.38c0,.07-.08.07-.17.05.93,1,.77-.19,1.94.47-.28.15,0,.6.22.66-.46-.28,0-.52.53-.44.63.62.87.37,1.24.63l-.37-.36c.28-.13.64.13,1.18.4-.07.2-.53-.19-.4,0,.81,0,1,1.24,1.86,1.56.22.4-.28.42-.07.74,1,.39.62.95,1.54,1.47,0-.47-.07-.45.71-.18-.47-.35-1-.69-1.45-1,.39.11.8.22,1.19.37-.38-.39-1-.58-1.2-.84.6.13.51.16.5-.23.22.87,1.31.76,1.68,1.63l-.66.59a3.63,3.63,0,0,0,1.2,1.29c.23.19.48.39.72.63a3.68,3.68,0,0,1,.6.91l-.16-.52c.41,0,.61.8.95,1.2-.28.1-.22.44-.28.71.21-.13.44,1,1,1a4.19,4.19,0,0,1-.12.79c.23,1.24,1.21,1.19,1.35,2.49-.38-.33-.49.25-.87-.52.08.4.08.76.27.75-.17.24.52,1.1.2,1.5.13.18.44.24.41.72-.06.05-.15,0-.15,0,.17,0,.16.76.52.36a5.15,5.15,0,0,0-.73,2.45,3.49,3.49,0,0,1-.85,2.21,15.87,15.87,0,0,1-.83,2.81c-.06-.09-.13-.07,0-.2-.74.94.52,1-.42,2.11-.75.38.12-.75-.25-.46-.95-.31-.62,1.5-1.65,1.94l.07-.21a1.82,1.82,0,0,0-.63,1,4.11,4.11,0,0,1-.75,1.39s0-.1-.11-.1c0,.94-1,2.12-1.64,3,0-.52.2-.5-.21-.63-.31.39.56.36-.09,1.11-.39.07-1,.41-1.38.16l.66-.63c-.71-.08-.86.8-1.29,1.06l-.1-.22c-1,1-.71,1.39-2,2.29l.23,0c-.34,1-.77.11-1.23.93l-.53-.36-.91,1a8.77,8.77,0,0,1-1.28,1.06,4,4,0,0,1,.78-1c.32-.34.64-.71.87-1-.23.14-.61.4-.95.66s-.66.49-.72.69c.17-.15.34-.41.58-.43a4.36,4.36,0,0,1-2,1.83c-.29-1.08-2.75.87-3.79.35-1.66,1.08-3.66,1.1-5.79,1.75,1,.65-.63.21-.26,1.05-.49.19-.69.23-.75.18-.57-.05-1.13-.09-1.69-.15s.44-.31.35-.5c-1.13.18-.56-.27-1.34-.34.22.28-.29.55-.95.55l1,.22c-1.47.81-1.5-.45-3,.3l.45-.37c-.78.32-3,.5-3.7,1.33-.16-.09-.38-.31,0-.43-1.95.17-4.31,1.25-5.88.87l.14-.23c-.36.08-.62.45-1.09.24,0-.09.14-.23,0-.24a2.61,2.61,0,0,1-1.46.29l.41-.25c-1.91-.26-2.94.6-4.58.67,0-.64-1.44-1-2.17-1.16l0-.09c-2.17-.33-3.78,0-5.85-.18-1.07-1-4.06-1.46-5.69-2.7.22.23-.26.45-.62.36-.35-.33-1.37-.19-1-.69l.14.08c-.05-.66-.91-1-1.54-1.41l-.54.6a3.72,3.72,0,0,0-1.09-1.31,13.43,13.43,0,0,0-1.42-1.06,11.32,11.32,0,0,1-1.22-1.05,1.57,1.57,0,0,1-.47-1.09c-.48-.21-.78-.7-1.23-.95l.36-.22c-.36-.53-.54-1-.8-1.42a9.7,9.7,0,0,1-.76-1.41l.38.14c-.2-.65-1.47-.58-1.64-1.4l.59-.34c-.21-1.5.39-3.09,0-4.72a.36.36,0,0,1,.27.36c0-.76.79-2.79-.1-2.68.56.08.36-1.6.38-2.52l.36.24a2.58,2.58,0,0,1-.26-2c.13-.22.38-.1.18.18.46-.71-.17-.74.39-1.61l.12.45a1.42,1.42,0,0,0,.08-1.32c.05-.57.79-1.43,1.17-1.37a1,1,0,0,1,.12-1.16c.16,0,.15.21.15.32.92-1.09.65-2.09,1.54-2.67a.32.32,0,0,0,.3,0c-.65.9-1.12,1.67-1.1,1.58.32.19.85-.52.93.36.11-.74.27-2.13,1-2.72a.53.53,0,0,1,.18,0l0,.1a1,1,0,0,0,.28-.47,3.71,3.71,0,0,0,.55-.48c.3.12.79-.65,1.1-1-.33-.26.12-.64-.51-.48.07,0,0,.1-.21.33a.7.7,0,0,0-.09.17v-.05c-.2.22-.44.52-.71.86a1.13,1.13,0,0,1,.68-1,7.19,7.19,0,0,1-.06-.93c.86-.06,1.94-.63,2.3-.46.85-1.1,2.38-2.12,2.68-3.25.28-.31.51-.06.7,0-.15.19-.39.32-.42.48.54-.6,1.93-1.28,1.84-1.84,1-.26-.25.71.92,0l-.09.23a6.53,6.53,0,0,0,3.16-1.71,5.11,5.11,0,0,1,3.6-1.34c-.22,0-.33,0-.4-.08,1.72-.3,3.4-.88,5.12-1.32a12.36,12.36,0,0,1,5.18-.42c1,.13,1.05-.24,1.64-.51l.2.46,1-.51c1.48-.29,2.35,1.25,4.2.86l-.18-.34c.64.13,2.06.24,1.88.55.08,0,.28-.27.49-.05l0,.24c.55,0,1.1,0,1.65,0,1.13.54-.45.84,1.23,1.43.64.14,2,0,1.84-.22s-.6-.38-.54-.61l.63.1c.36-.61,1.11-1.1-.23-2.11-.4,0-.79,0-1.19,0l-.24-.43c.3.09.61.17.91.27-.4-.48-.83-.3-1.24-.24a.74.74,0,0,0-.34-.5c-.41.09-.84.23-1.24.34-.06-.3.62-.39-.06-.73-.58.17.32.72-.55.7-.44-.45-.23-.66-.91-.53-.05-.19.11-.28.37-.3-.6.09-1.47-.24-1.83.09-.49-.49-1.88-.19-1.74-.82a4.25,4.25,0,0,1-1.56.39c1-.73-1.93-.17-1.65-1-.73.69-2.57.3-3.78.83.07-.06.19-.19.31-.16a5.72,5.72,0,0,1-1.39-.28c0,.6-1.08.85-1.58,1.32-.93-.42.39-.77.05-1.26.11.46-1.39.71-1,1.06-.7-.22-.58-.06-1-.47,0,.75-.58.24-1,.81-1-.13-.4-.61-1.35-.14C257,174.62,257.82,174.13,257.82,174.13Zm-20,13.61h0l.29-.41C238,187.4,237.91,187.52,237.77,187.74Zm-1.16,1.69.5-.73c.17,0,.24.17.12.33C237.21,188.88,236.88,189.24,236.61,189.43Zm4.8-1.54c-.14.26-.26.28-.36.25.08-.11.18-.24.3-.42l0-.06A.43.43,0,0,1,241.41,187.89Z"
                    />
                    <path className="color" d="M241.36,187.13a.6.6,0,0,1,.06-.11l-.19.06,0,.17Z" />
                    <path className="color" d="M262.25,175.51h0a.17.17,0,0,1-.1,0S262.23,175.5,262.25,175.51Z" />
                    <polygon className="color" points="234.98 216.69 235.06 216.62 234.86 216.54 234.98 216.69" />
                    <path className="color" d="M251.69,178.52a.29.29,0,0,0-.18,0A.34.34,0,0,0,251.69,178.52Z" />
                    <path className="color" d="M247.45,180.71l-.66.23A4.36,4.36,0,0,0,247.45,180.71Z" />
                    <path className="color" d="M244.23,182.54a.45.45,0,0,0,0,.19h0Z" />
                    <path className="color" d="M299.6,177.87l.13.06C300.07,178.05,299.85,178,299.6,177.87Z" />
                    <path className="color" d="M283,172.31a3.69,3.69,0,0,1,.58-.09C283.31,172.13,283.08,172.08,283,172.31Z" />
                    <path className="color" d="M311,194.44h0v0Z" />
                    <path className="color" d="M284.41,172.38a1.61,1.61,0,0,0-.8-.16A2.48,2.48,0,0,0,284.41,172.38Z" />
                    <path className="color" d="M233.71,194.78l-.09.16a.1.1,0,0,1,.06.05Z" />
                    <path className="color" d="M233.68,195l0,.2C233.68,195.11,233.71,195,233.68,195Z" />
                    <path className="color" d="M233.58,195.63l.07-.44C233.59,195.33,233.51,195.49,233.58,195.63Z" />
                    <path className="color" d="M236.29,190.5l-.09-.13A.26.26,0,0,0,236.29,190.5Z" />
                    <path className="color" d="M237.15,189.25c-.24.27-.81.54-1,1l.08.11C236.14,190,237.16,189.68,237.15,189.25Z" />
                    <path
                      className="color"
                      d="M242.71,186.09c-.32.23-.67.44-1,.7.26,0,.6-.06.24.35C243.41,186.5,241.49,187.06,242.71,186.09Z"
                    />
                    <path className="color" d="M245.77,184c-.48.42.15.19.17.29C246.19,184,246.25,183.86,245.77,184Z" />
                    <path className="color" d="M270.46,173.83v.38C270.93,174.09,270.43,174.07,270.46,173.83Z" />
                    <polygon className="color" points="275.5 171.4 274.98 171.18 274.76 171.54 275.5 171.4" />
                    <polygon className="color" points="278.51 174.18 278.3 174.22 279.11 174.14 278.51 174.18" />
                    <path className="color" d="M306.69,199.37l.5,0C307.19,199,306.69,198.82,306.69,199.37Z" />
                    <path className="color" d="M296.26,214.6a1,1,0,0,0-1,.48C295.66,214.88,296.12,214.8,296.26,214.6Z" />
                    <polygon className="color" points="241.4 217.42 241.79 217.5 241.15 217.21 241.4 217.42" />
                  </g>
                </g>

                {/* port 1 extensor circle */}
                <g className="mixBlendModeMultiply">
                  <g>
                    <path className="color" d="M361.21,271.1c.08.17.38.18.45-.21l-.39-.4Z" />
                    <path
                      className="color"
                      d="M362.89,268.93c-.05-.5-.24-1.15-.78-1,.28.6,0,.62.41,1.28-.07.38-.36.58-.51.46.08.17-.29.54-.06.83a1.67,1.67,0,0,0,.64-1.68C362.75,268.69,362.82,268.86,362.89,268.93Z"
                    />
                    <path className="color" d="M391.31,247.37l-.24,0A.53.53,0,0,0,391.31,247.37Z" />
                    <path className="color" d="M413.51,246.17c-.17,0-.25,0-.27.05C413.41,246.21,413.54,246.22,413.51,246.17Z" />
                    <path className="color" d="M417,247.71l-.2-.1C416.89,247.68,417,247.73,417,247.71Z" />
                    <path className="color" d="M391.31,247.37c.21,0,.41,0,.62,0C391.92,247.16,391.6,247.31,391.31,247.37Z" />
                    <path className="color" d="M364.07,263.7a1.15,1.15,0,0,0-.07.36c0-.1.08-.2.13-.3Z" />
                    <path className="color" d="M382.26,251.68l-.17.08a1.44,1.44,0,0,0,0,.24Z" />
                    <path
                      className="color"
                      d="M375.63,255.44c.15-.08,0-.47-.07-.66a.56.56,0,0,1-.16.45A.68.68,0,0,0,375.63,255.44Z"
                    />
                    <path className="color" d="M366.45,263.12l-.06.21Z" />
                    <path className="color" d="M387.31,249.47a.29.29,0,0,0,.13.1A.23.23,0,0,0,387.31,249.47Z" />
                    <path className="color" d="M400.27,245.41a.16.16,0,0,0,0,.07C400.32,245.45,400.34,245.42,400.27,245.41Z" />
                    <path className="color" d="M408.69,249.74l-.13,0a1.39,1.39,0,0,0-.11.21Z" />
                    <path className="color" d="M423.12,251l0,0C422.91,250.88,423,250.92,423.12,251Z" />
                    <path className="color" d="M409.11,292.68c.81.18-1,.76.14.89C409.11,293.44,410.06,292.69,409.11,292.68Z" />
                    <path className="color" d="M364.23,263.55c.06-.1.11-.19.18-.29A1,1,0,0,0,364.23,263.55Z" />
                    <path className="color" d="M409.25,293.57h.12Z" />
                    <path className="color" d="M434.49,260.86a.43.43,0,0,0,.09-.21S434.52,260.72,434.49,260.86Z" />
                    <path className="color" d="M427.05,252.26l.22.21A1.39,1.39,0,0,0,427.05,252.26Z" />
                    <path className="color" d="M436.45,266.26c0,.16-.1.21,0,.42l0-.06A.34.34,0,0,1,436.45,266.26Z" />
                    <path className="color" d="M435.55,272.44a.87.87,0,0,0,.11-.09l0-.2Z" />
                    <path className="color" d="M379.61,249a1.31,1.31,0,0,1,.44.23C379.83,249,380.74,248.52,379.61,249Z" />
                    <path className="color" d="M364.28,263.82a.27.27,0,0,1,0-.27l-.1.21A.15.15,0,0,0,364.28,263.82Z" />
                    <path className="color" d="M439.77,266.47l-.07,1.19A10.45,10.45,0,0,0,439.77,266.47Z" />
                    <path className="color" d="M365.56,290.16l-.22-.14A.38.38,0,0,0,365.56,290.16Z" />
                    <path
                      className="color"
                      d="M439.31,271.09a2.46,2.46,0,0,0-.42.57.46.46,0,0,0,.07.16C439.08,271.58,439.21,271.34,439.31,271.09Z"
                    />
                    <path className="color" d="M380.05,249.24Z" />
                    <path
                      className="color"
                      d="M386.6,246c-1,.25-.34.65-.48,1-1.15.49-.66-.23-1.15-.39-.71.37-1.12,1-1.68,1.19-.06-.08-.18-.07-.09-.22-.64.66-2.3.82-3,1.7a.33.33,0,0,1-.17-.08,1.15,1.15,0,0,1,.42.65c-.42.18-.64.65-1,.39.27-.11.23-.25.31-.41l-.38.34c-.61-.3.53-.43.38-.78a12.58,12.58,0,0,1-2.34,1.57c-.37-.4,1.47-.89.39-.88q.56-.17,1.11-.3c-1.12-.39.66-.23-.43-.69-1.44.5-1.43.94-2.83,1.53-.16.41.3.31.14.72a1.85,1.85,0,0,1-1.76.63,1.07,1.07,0,0,0-1.32.59c-.15.52.1,1.12-1,1.52l-.05-.69c-1.21.88-.15,1.15-1.56,1.86.05-.35.75-.9.54-.81-1.06.31-.33.71-.89,1.22l-.46-.26a29.85,29.85,0,0,0-2.95,4.1c-.06-.16,0-.49-.38-.26-1.12,1.9-2.62,3.86-3.78,5.7l.08.92c-.07.17-.32.24-.31,0-.48.7.23.15.24.58s-.45.48-.47.16a20.74,20.74,0,0,1-1.26,5.53l-.07-.32c-.41,1.15.64,1.47.09,2.48l-.05-.22c-.53,2.55-.2,5.3-.41,7.51.35.14.43.82.62,1.48s.52,1.28.94,1.14a12.77,12.77,0,0,1,.28,1.41,5.27,5.27,0,0,0,.74,1.73c.3.5.94.35,1.47.8l-.34.31,1,.39c0,.25,0,.49,0,.74l.56.38c-.17-.21-.26-.54-.13-.6.84.57,1.62,1.89,1.5,2.1.7.44,1.46.76,2.18,1.12-.14.13-.51-.05-.84-.14,1.33.34-.1.57,1.15.84-.08-.17.22-.19.29-.26a3.66,3.66,0,0,0,1,.88,11.81,11.81,0,0,0,1.45.68l-.31.19a27.21,27.21,0,0,0,5.41,2c-.64-.35-.31-.83.24-.71l.08.54c.44-.18-.51-.36.31-.49.69.24.33.66-.12.71l.9.06c0,.16-.2.18-.31.34.43-.2,1.4.87,2,.45v.16a33.83,33.83,0,0,0,4.43.53c.08-.42.68-.24,1.18-.55a17.65,17.65,0,0,0,3.8.67c1-.19.29-.35.74-.6.06.39,1.45.38.73.64a20.73,20.73,0,0,0,4.22-.5c-.24-.14-.5-.2-.37-.34.37-.07.87.11.82.3l-.09.05c2.28-.71,5.54.61,7.3-.5l-.1.05c.62-.23,1.23-.49,1.85-.74.89-.09-.48.38.22.5,1.93-1,3.27-.57,4.86-1.41,1.6.78,4.56-1.35,6.49-1.3l-.19-.22c.36-.4.59-.05.94-.11-.12-.18-.56-.05-.34-.29,3.61-1.71,7.78-3,11.34-5.38,1.29-.89-.14-1.56,1.71-2.36l-.09.74c.48-.64,1-1.19,1.57-1.78s1.06-1.18,1.61-1.75,1-1.23,1.47-1.86a14.6,14.6,0,0,0,1.13-2c0,.21.12.29-.05.54.71-.32,1.23-2.08,1-2.21.25-.4.28,0,.56-.17.51-.48.27-1.68.74-1.85.08,0,0,.22,0,.34a5.86,5.86,0,0,1,.35-1.06c.11-.38.16-.67-.1-.54a5.47,5.47,0,0,0,.54-1.56,4.59,4.59,0,0,1,.43-1.43c-.3-.67.58-1.92,0-2.21.66.19.78-2,.41-2.75.2.26.22-.65.5-.36,0-.88-.26-1.69-.58-1.49a3,3,0,0,0-.31-2.29c-.34-.65-.59-1.2-.28-1.8a23.57,23.57,0,0,0-4.37-5.64c.6-.42,1.61,1.86,2.11,1.38-1.53-1.6-2.78-2.05-4.18-3.55-.34-.42.42,0,.64,0-1.73-1.19-3.1-2.59-4.84-3.25,0-.05.24,0,.42,0-.31-.17-.65-.53-.78-.25l.34.12c.24.67-1.69.05-1.86.24,1-.47-1.41-1.06,0-1.56-.23-.07-.56-.08-.61.12-.28-.22-.32-.38.1-.41-1.2-.46-.95,0-2-.48.07-.13.3-.08.49-.18a3.65,3.65,0,0,1-2.13-.51c.09-.06,0-.21.31-.09-1.56-.67-2.91-.43-4.53-1.27.72-.46-.52-.39-.45-1l-1-.13.31.38c-.83-.28-1.68,0-2.35-.4l.68-.07c-.53-.09-1.06-.2-1.6-.25a9.37,9.37,0,0,1,.85.4c-.91.08-.06.69-1.14.32.24,0-.82-.16-1.21-.57h0a2.45,2.45,0,0,1-1.5,0c-.14-.2.21-.6.12-.73a2.07,2.07,0,0,1-1.26.14,2.29,2.29,0,0,0-1.33.24.42.42,0,0,0,.16-.46l-.37.35c-.39-.15-.45-.21-.37-.44-1.19-.12.35.71-1.05.37.11,0,.06-.08.29-.14-1.42-.21-2.74.24-4,.12-.43-.55,1.13-.19.66-.64a18.17,18.17,0,0,0-2.86.59,17.17,17.17,0,0,1-2.78.61h.34c-.1.84-1.4-.13-2.23.44.21-.12.2-.5.16-.4a15.38,15.38,0,0,0-4.17,1.6l.16-.26a19.12,19.12,0,0,0-2.64.7c-.15.28-.58.42-.22.59-2.73-.17-4,2.38-6.33,2.39.23-.11.48-.41.3-.33l-1.58,1c.28.25.31.08.77.16a2,2,0,0,1-.92.84c.64-.55-.25-.5-.65-.51.1.07,0,.23.12.32-1.13-.12.17.69-1.18.91l0-.19a5.83,5.83,0,0,1-1.15.94c-.38-.25.36-.42.24-.72-.64.39-.91,1.36-1.68,1.35.2-.26.6-.47.82-.72a1.93,1.93,0,0,0-1.39.31l0,0-1.19.48.34-.06c-.24,1.35-1.5,1.2-2.13,2.47.61-1.23-.06-.43-.25-.85-.33.09-.81.27-.77.09-.26.66-1,.36-1.33,1.33-.12-.09-.5.41-.63,0-.53.61.31.07.37.26-.28.59-.94.9-1.58,1.37a3.9,3.9,0,0,0-1.64,1.88c-.8,1.3-.53,1.86-1.14,3.07-.47.24-.21-.61-.21-.61a3,3,0,0,0-1.12,1.67c0-.18-.21-.12-.46,0-.26.52.23.58-.3,1.14a1.84,1.84,0,0,1-.24-.79c-.22.66-.27,1.39-.47,2.06-.31.05-.15-.54-.19-.84a12.47,12.47,0,0,0-.41,1.3,1.46,1.46,0,0,0,0,1l.32-.4c-.09.27-.37,0-.36-.22,0-.76.54-.82.68-.79l-.14.48c1-.07.73-1.82,1.32-2.65l.32.66.09-1.12c.25-.09.62,0,.45.43.62-.42.13-.64.74-.95.08,0,.09,0,.07.08l.25-.65c0,.18.43.17.11.45,1-.74.78-1.85,1.46-1.87l0,.1c.94-1.4-.24-.42.2-1.74.46,0,.95.11,1.41.18l-.21-.44c.14-.11.41-.32.49-.15.24-.67-.22-.06-.16-.54.87-.29,1.62-1.67,2.22-1.24,0-.47-.78.31-.25-.46.68.46.74-.73,1.56-.91.06.47-.64.73.18.56-.05-.84,1.29-.71,1.73-1.18-.28-.49,1.05-.93,1.88-1.64,0,.18,1.91-.75,2.89-1l0,.09c-.08-.57.88-1,1.51-1.39.12.31.05.48-.24.8l.63-.31c.07-.23.23-.41.62-.67l0,.45a9.63,9.63,0,0,1,2.73-1.5c-.09-.38-1.32-.57-.25-1.34.13.17.32.47.05.69.09-.07.29-.32.53-.33l-.33.53c.57-.08.15-.38.57-.53.11.27.38.06.42.3-.09.07-.41,0-.51.22a2.33,2.33,0,0,1,1.37-.11c-.1-.14-.16-.37.16-.55.86-.38.44.2,1,.14.13-.28.76-.31.61-.72.26-.11.38.07.52.14.37-.36,2.1-.81,1.43-1.08h-.13l.07,0h0c1.37-1,3.23-.76,4.71-1.31l0,.15a18.67,18.67,0,0,0,2.63-1c.28,0,.7.17.61.36a3,3,0,0,1,1.81-.28c-.69.33.27.19-.71.28.94,0,1.16.25,2.12-.26-.31.41.72.41,1.15.3l-.66-.25a8,8,0,0,1,1.37,0l-.22.51c1.84.53,3.42-1,4.79.1.52-.31-1-.32-.53-.69.88.11,1.69.94,1.95,1,1.12.42,1.2-.58,2.39-.17-.12-.2-.19-.7.78-.68.86.24.88,1,.32,1-.2,0-.29-.11-.27-.16-.29,0-.66,0-.36.27l.14-.16c.39.25,1.54.54,1.2.75.67,0,.34-.21-.11-.42,1,.5,1.68.44,2.71,1-.14-.14-.24-.39-.07-.34,1.53.72.81-.08,1.92.23.51.49-.45.53.71.72.57.43-.05.48-.36.53,1.09.06,1.67,1,2.17,1.26l-.55-.09a2.57,2.57,0,0,1,.81.29l-.12-.46c.26.2.51.32.43.45.41-.06,0-.65.78-.64.31.36,1.26.44,1.18.93-1.13-.77-.09.49-1.14,0a1.88,1.88,0,0,1,.71.39c0,.07-.08.06-.17,0,.92,1,.77-.2,1.93.47-.27.14,0,.59.23.65-.46-.27,0-.51.53-.43.63.61.87.36,1.24.62l-.38-.36c.29-.12.65.13,1.19.4-.07.2-.53-.19-.41,0,.82,0,1,1.25,1.87,1.56.22.4-.28.42-.07.74,1,.4.62,1,1.54,1.47,0-.46-.07-.44.71-.17a16.36,16.36,0,0,0-1.46-1,11.74,11.74,0,0,1,1.19.37c-.37-.39-1-.59-1.19-.85.6.13.51.17.5-.23.22.87,1.31.77,1.68,1.63l-.66.6a3.66,3.66,0,0,0,1.19,1.28c.24.19.48.39.73.63a4.22,4.22,0,0,1,.6.91l-.16-.51c.41,0,.61.8.95,1.2-.28.1-.22.43-.29.71.22-.14.45,1,1.05,1a4.42,4.42,0,0,1-.12.8c.23,1.23,1.21,1.19,1.35,2.48-.39-.32-.49.25-.87-.51.08.4.08.76.27.74-.18.25.52,1.1.2,1.51.13.17.44.23.41.71-.06.05-.15,0-.15,0,.17,0,.16.76.52.35a5.19,5.19,0,0,0-.73,2.45,3.54,3.54,0,0,1-.85,2.22,15.75,15.75,0,0,1-.83,2.8c-.06-.08-.13-.06,0-.2-.74.95.52,1.05-.42,2.11-.75.38.12-.75-.25-.46-1-.3-.62,1.51-1.65,1.94l.07-.21a1.85,1.85,0,0,0-.63,1.05,4.07,4.07,0,0,1-.75,1.38s0-.09-.11-.1c-.05.95-1,2.12-1.64,3,0-.52.2-.51-.21-.63-.31.38.56.36-.09,1.11-.39.06-1,.4-1.38.16l.66-.63c-.71-.08-.86.8-1.29,1.05l-.1-.22c-1,1-.71,1.39-1.95,2.29l.23.05c-.35,1-.77.12-1.23.94l-.53-.37-.91,1a8.86,8.86,0,0,1-1.28,1.07,3.79,3.79,0,0,1,.78-1c.32-.34.64-.71.87-1-.23.14-.61.4-1,.66a2,2,0,0,0-.72.69c.17-.15.34-.4.58-.42a4.52,4.52,0,0,1-2,1.83c-.29-1.09-2.75.86-3.8.35-1.65,1.08-3.65,1.09-5.78,1.75,1,.65-.63.2-.26,1-.49.19-.69.22-.76.17-.56,0-1.12-.08-1.68-.15s.44-.31.35-.5c-1.13.19-.56-.27-1.34-.34.22.29-.29.55-.95.55l1,.23c-1.47.8-1.5-.46-3,.3l.45-.37c-.78.32-3,.5-3.7,1.32-.16-.09-.38-.31,0-.42-2,.17-4.31,1.25-5.88.86l.14-.23c-.36.08-.62.45-1.09.25,0-.1.14-.23,0-.24a2.8,2.8,0,0,1-1.46.29l.41-.26c-1.91-.26-2.94.61-4.58.67,0-.64-1.44-1-2.17-1.16l0-.09c-2.17-.32-3.77,0-5.85-.18-1.06-1-4.05-1.45-5.68-2.69.22.23-.26.45-.62.36-.36-.34-1.38-.2-1-.7l.14.09c-.05-.67-.92-1-1.54-1.42l-.54.6a3.69,3.69,0,0,0-1.09-1.3,13.52,13.52,0,0,0-1.42-1.07,10.32,10.32,0,0,1-1.23-1.05,1.58,1.58,0,0,1-.46-1.09c-.48-.2-.79-.69-1.23-.94l.36-.23c-.36-.53-.54-1-.81-1.42a10.18,10.18,0,0,1-.75-1.41c.12.06.25.1.38.15-.21-.65-1.47-.58-1.64-1.41l.59-.33c-.21-1.51.39-3.1,0-4.72a.36.36,0,0,1,.27.36c.05-.76.79-2.79-.1-2.68.55.08.36-1.61.38-2.53l.36.24a2.55,2.55,0,0,1-.26-2c.13-.22.38-.1.18.18.46-.71-.17-.75.39-1.61l.12.44a1.42,1.42,0,0,0,.08-1.32c0-.57.79-1.43,1.17-1.37a1,1,0,0,1,.12-1.15c.16,0,.15.21.15.31.92-1.09.65-2.08,1.54-2.67a.29.29,0,0,0,.3,0c-.65.91-1.12,1.68-1.1,1.59.32.19.85-.52.93.35.11-.74.27-2.13,1-2.71a.53.53,0,0,1,.18,0l0,.09a.92.92,0,0,0,.28-.47,3.71,3.71,0,0,0,.55-.48c.3.12.79-.65,1.1-.95-.34-.27.12-.64-.51-.49.07,0,0,.1-.21.33a1.06,1.06,0,0,0-.1.17v-.05c-.2.23-.44.52-.71.86a1.12,1.12,0,0,1,.68-1A7.23,7.23,0,0,1,370,258c.86-.05,1.94-.62,2.3-.46.85-1.09,2.37-2.12,2.68-3.25.28-.3.51-.05.7,0-.15.19-.39.32-.42.49.54-.61,1.93-1.29,1.84-1.85,1-.26-.25.71.92,0l-.09.23a6.7,6.7,0,0,0,3.16-1.71,5.07,5.07,0,0,1,3.6-1.35c-.22,0-.33,0-.4-.08,1.72-.29,3.39-.88,5.11-1.32a12.58,12.58,0,0,1,5.19-.42c1,.14,1-.23,1.64-.5l.2.46,1-.51c1.48-.29,2.35,1.25,4.2.85l-.18-.34c.64.14,2.06.25,1.88.55.07,0,.28-.27.49,0l0,.23,1.65,0c1.13.55-.45.84,1.22,1.43.65.15,2,0,1.85-.22s-.6-.38-.54-.61l.63.11c.36-.62,1.11-1.1-.23-2.12l-1.19,0-.24-.43c.3.1.61.17.91.28-.4-.48-.83-.31-1.24-.24a.78.78,0,0,0-.34-.5c-.42.09-.84.22-1.24.34-.06-.3.62-.4-.06-.74-.58.17.32.72-.55.7-.44-.44-.23-.65-.91-.52-.05-.2.11-.28.37-.31-.6.1-1.48-.23-1.83.1-.49-.49-1.88-.19-1.74-.83a4.11,4.11,0,0,1-1.56.39c1-.73-1.93-.17-1.65-1-.73.68-2.57.3-3.78.82.07-.06.19-.18.31-.16a5.68,5.68,0,0,1-1.39-.27c0,.6-1.08.85-1.59,1.31-.92-.42.4-.76.06-1.26.11.47-1.39.72-1,1.06-.7-.21-.58-.05-1-.46.05.74-.57.23-1,.81-1-.13-.4-.62-1.35-.15C385.77,246.52,386.6,246,386.6,246Zm-20.05,13.6h0c.13-.18.23-.32.29-.42C366.78,259.3,366.69,259.42,366.55,259.63Zm-1.16,1.69.5-.73c.16,0,.24.17.12.34C366,260.78,365.65,261.13,365.39,261.32Zm4.8-1.54c-.14.26-.26.29-.36.26l.3-.42,0-.06A.45.45,0,0,1,370.19,259.78Z"
                    />
                    <path className="color" d="M370.14,259a.6.6,0,0,1,.06-.11L370,259l0,.16Z" />
                    <path className="color" d="M391,247.4h0a.29.29,0,0,1-.1,0Z" />
                    <polygon className="color" points="363.76 288.59 363.83 288.51 363.64 288.43 363.76 288.59" />
                    <path className="color" d="M380.47,250.41a.39.39,0,0,0-.18,0S380.38,250.41,380.47,250.41Z" />
                    <path className="color" d="M376.23,252.61l-.66.22A4.55,4.55,0,0,0,376.23,252.61Z" />
                    <path className="color" d="M373,254.44a.49.49,0,0,0,0,.19h0Z" />
                    <path className="color" d="M428.38,249.76l.13.07C428.85,249.94,428.63,249.84,428.38,249.76Z" />
                    <path className="color" d="M411.81,244.21a3.69,3.69,0,0,1,.58-.09C412.09,244,411.85,244,411.81,244.21Z" />
                    <path className="color" d="M439.78,266.34h0v0Z" />
                    <path className="color" d="M413.19,244.27a1.5,1.5,0,0,0-.8-.15A2.41,2.41,0,0,0,413.19,244.27Z" />
                    <path className="color" d="M362.49,266.68l-.09.16a.07.07,0,0,1,.06,0Z" />
                    <path className="color" d="M362.46,266.88l0,.21C362.46,267,362.49,266.93,362.46,266.88Z" />
                    <path className="color" d="M362.36,267.52l.06-.43C362.37,267.22,362.29,267.39,362.36,267.52Z" />
                    <path className="color" d="M365.07,262.4l-.09-.14A.28.28,0,0,0,365.07,262.4Z" />
                    <path
                      className="color"
                      d="M365.93,261.15c-.24.26-.81.53-1,1l.08.11C364.92,261.93,365.94,261.57,365.93,261.15Z"
                    />
                    <path
                      className="color"
                      d="M371.49,258c-.32.24-.67.45-1,.7.26,0,.6-.05.24.35C372.19,258.39,370.27,259,371.49,258Z"
                    />
                    <path className="color" d="M374.55,255.91c-.48.42.15.19.17.28C375,255.85,375,255.76,374.55,255.91Z" />
                    <path className="color" d="M399.24,245.72v.39C399.71,246,399.21,246,399.24,245.72Z" />
                    <polygon className="color" points="404.27 243.3 403.76 243.08 403.54 243.44 404.27 243.3" />
                    <polygon className="color" points="407.29 246.07 407.08 246.11 407.89 246.03 407.29 246.07" />
                    <path className="color" d="M435.47,271.26l.5,0C436,270.9,435.47,270.72,435.47,271.26Z" />
                    <path className="color" d="M425,286.5a1,1,0,0,0-1,.47C424.44,286.78,424.9,286.69,425,286.5Z" />
                    <polygon className="color" points="370.18 289.32 370.57 289.4 369.93 289.11 370.18 289.32" />
                  </g>
                </g>

                {/* arrow device-extensor */}
                <g className="mixBlendModeMultiply">
                  <g>
                    <path className="color" d="M269.33,210.35c-.17-.08-.56,0-.48.19l.66.16Z" />
                    <path
                      className="color"
                      d="M268.14,211.87a1.68,1.68,0,0,0,1.5.37c-.64-.25-.38-.32-1.14-.59-.08-.22.2-.39.45-.36-.18-.07.13-.34-.28-.46-.51.29-.52.67-.09,1A.66.66,0,0,1,268.14,211.87Z"
                    />
                    <path className="color" d="M270.71,233.86l0-.16A.23.23,0,0,0,270.71,233.86Z" />
                    <path className="color" d="M276.43,246.55a.16.16,0,0,0-.2-.05C276.32,246.56,276.4,246.6,276.43,246.55Z" />
                    <path className="color" d="M277.18,249c0-.06,0-.1,0-.15S277.12,249,277.18,249Z" />
                    <path className="color" d="M270.71,233.86l-.08.42C270.84,234.24,270.72,234.05,270.71,233.86Z" />
                    <path className="color" d="M269.83,214.82a.47.47,0,0,0-.19-.18.71.71,0,0,1,.08.18Z" />
                    <path className="color" d="M268.5,228.11l0-.11a1.2,1.2,0,0,0-.28,0Z" />
                    <path
                      className="color"
                      d="M267.48,223.49c0,.11.55,0,.8,0-.23,0-.36-.08-.41-.16A1.57,1.57,0,0,0,267.48,223.49Z"
                    />
                    <path className="color" d="M267.62,216l-.08-.13Z" />
                    <path className="color" d="M269.24,231.42a.72.72,0,0,0-.18.1A.52.52,0,0,0,269.24,231.42Z" />
                    <path className="color" d="M380.45,274.48s0,.06,0,.09S380.48,274.47,380.45,274.48Z" />
                    <path className="color" d="M386.07,276.59l-.07,0c0,.1,0,.21,0,.31Z" />
                    <path className="color" d="M279.35,252.92v0C279.22,252.84,279.27,252.89,279.35,252.92Z" />
                    <path className="color" d="M313.48,274c-.28-.61.9-.39.42-1.13C313.9,273.12,313,273.54,313.48,274Z" />
                    <path className="color" d="M269.76,214.94a1.23,1.23,0,0,1,0,.19A.28.28,0,0,0,269.76,214.94Z" />
                    <path className="color" d="M313.9,272.89h0l0-.07Z" />
                    <path className="color" d="M286.86,260a.7.7,0,0,0,.08-.26A.52.52,0,0,0,286.86,260Z" />
                    <path className="color" d="M281.93,254.13l.07.18A.34.34,0,0,0,281.93,254.13Z" />
                    <path
                      className="color"
                      d="M290.44,261.75c.06.1,0,.18.2.2a.22.22,0,0,0,0-.08C290.56,261.9,290.48,261.89,290.44,261.75Z"
                    />
                    <path className="color" d="M293.78,264.06a.57.57,0,0,0,0-.13l-.12-.05Z" />
                    <path className="color" d="M368.61,275.61a2.1,2.1,0,0,1,.2.49C368.73,275.71,369.3,275.54,368.61,275.61Z" />
                    <path className="color" d="M269.51,214.84c.15,0,.22,0,.25.1a.56.56,0,0,0,0-.12A.35.35,0,0,0,269.51,214.84Z" />
                    <path className="color" d="M293.21,258.28l.44.42A2,2,0,0,0,293.21,258.28Z" />
                    <path className="color" d="M340.55,274.89l.15-.06A.13.13,0,0,0,340.55,274.89Z" />
                    <path className="color" d="M295.16,259.66a1,1,0,0,0,.06.51.5.5,0,0,0,.14-.08Z" />
                    <path className="color" d="M368.81,276.11h0Z" />
                    <path
                      className="color"
                      d="M372.83,274.56c-.59,0-.23.74-.33,1.17-.7.25-.36-.53-.62-.89-.43.22-.73.92-1.06.91,0-.12-.1-.16,0-.32-.44.61-1.39.1-1.9.86a.55.55,0,0,1-.08-.18,3.58,3.58,0,0,1,.13,1c-.27,0-.48.49-.6,0,.17,0,.17-.19.24-.34l-.27.22c-.28-.69.37-.26.35-.77-.53.25-1.15.85-1.58.67-.11-.68,1-.27.39-.85l.66.23c-.54-1.05.39.06-.1-1.07-.86-.15-.94.38-1.79.22-.18.38.08.55-.1.94-1.19.71-1-1.69-1.85-.76-.22.46-.29,1.32-.93.88l.2-.77c-.82-.06-.45,1.11-1.32.6.15-.3.64-.26.51-.35-.56-.6-.38.44-.81.45l-.1-.68c-.87.12-1.83.6-2.81.73.06-.2.22-.42,0-.62a6.5,6.5,0,0,1-3.77-.54l-.47.57c-.1,0-.18-.27-.07-.38-.45-.23,0,.37-.26.6-.26,0-.33-.35-.16-.52-.82.48-2.35,1-3.18.33l.18-.17c-.65-.27-.81,1.17-1.4.59l.12-.1c-1.42-.32-3,.1-4.09-.86-.27.83-1.39-.49-1.58.68-.77-.65-.52-.84-1.63-1.34-.3-.08-.53.69-.92.78l.05-.62-.58.6-.2-.76-.37.11a.51.51,0,0,1,.23.49c-.59.21-1.31-.58-1.29-.9l-1.38.37c.06-.24.29-.3.49-.44-.78.55-.05-.65-.76-.16.07.15-.09.35-.12.48a1.67,1.67,0,0,0-1.56-.43l.16-.41c-1-.22-2.07-.09-3.16-.25.36.25.16,1-.17,1l0-.67c-.27.37.3.3-.2.72-.4-.14-.16-.77.11-.95l-.53.14c0-.19.13-.27.2-.51-.27.36-.74-.79-1.14-.15V273c-1.08-.19-1.6-.06-2.49-.2-.12.55-.44.37-.79.76a7.77,7.77,0,0,0-2-1c-.6.16-.26.44-.57.71.06-.51-.72-.63-.24-.9a8.27,8.27,0,0,0-2.47,0c.08.24.2.36.09.51s-.44-.32-.35-.55l.07,0c-1.52.43-2.64-2.21-3.94-1.47l.07,0-1.22.22c-.47-.22.4-.28.13-.69-1.4.5-1.77-.67-2.88-.42-.26-1.65-2.6-.77-3.24-2l-.07.35c-.37.24-.23-.3-.38-.45-.07.27.15.41-.07.53-2.25-.4-4.13-2.16-6-3.43-.71-.44-1.23,1.48-1.81.24l.56-.46a5.45,5.45,0,0,1-2.45-.82,6.08,6.08,0,0,0-2.36-1c.17-.09.27-.26.41-.18-.08-.57-1.1-.67-1.31-.33-.19-.17.13-.34.1-.59-.15-.42-1.07.07-1-.43,0-.08.16-.08.24-.08-.32.08-.87-.6-1,0-.38-.56-1.13-.45-1.36-1-.61.33-.71-.82-1.29-.17.55-.72-.45-1.23-1-1.12.27-.14-.11-.43.24-.64-.36-.25-.79-.35-1,.06,0-1.36-1.84-.34-1.33-1.71a16.15,16.15,0,0,1-3.49-1.68c.63-.62,1,.82,1.63.08-1.1-.44-2.08-.37-2.74-1.3-.13-.29.39-.16.57-.21-1.1-.5-1.45-1.61-2.51-2a.52.52,0,0,1,.33,0c-.16-.12-.22-.42-.51-.13l.22.07c-.22.63-1.47.25-1.72.42,1.1-.52-.43-1,1-1.53a.56.56,0,0,0-.58.16c-.07-.2,0-.35.38-.41-.63-.39-.8.08-1.21-.42.16-.13.3-.07.52-.17-.5,0-1,0-1.22-.55.11,0,.19-.2.29-.07-.61-.7-1.8-.65-2.11-1.71.87-.25,0-.45.61-.93l-.49-.33-.17.39c-.26-.4-1-.46-1-.94l.46.13-.63-.68.06.58c-.61-.2-.77.56-1-.1.13.08-.25-.43,0-.88h0c-.33-.08-.67-.17-.7-.58.15-.2.74-.36.85-.49-.66.11-.74-.89-1.46-.83a1.11,1.11,0,0,0,.58-.24l-.54.07c0-.28.09-.35.38-.47-.23-.65-.73.65-.75-.27.07,0,.12,0,.25.06-.18-.82-1-1.24-1.13-2,.58-.53.44.51.9,0-.56-.9-1.75-1.63-2-2.66v.21c-1,.28.2-.93-.46-1.23.12.1.61-.06.49,0-.09-.72-.81-1.24-1.45-2.16l.3,0c.09-.48-.22-1.09-.25-1.56-.3,0-.34-.31-.66,0a1.66,1.66,0,0,0-.27-2c-.4-.56-.84-1.12-.37-1.87,0,.14.32.28.29.17-.18-.32-.33-.65-.49-1-.43.18-.24.2-.54.5a.86.86,0,0,1-.63-.58c.41.4.73-.17.93-.43-.13.07-.29,0-.43.08.68-.72-.93.11-.55-.76h.24c-.18-.25-.55-.45-.55-.77.5-.23.31.25.75.18-.12-.41-1.18-.64-.72-1.13.18.16.22.42.41.57.53-.53.38-.55.42-.88v0l.16-.76-.13.21c-1.47-.3-.43-1-1.46-1.62,1,.57.52,0,1.13,0,.13-.2.27-.51.45-.45-.54-.27.31-.62-.45-1,.19,0,0-.36.47-.35-.21-.42-.33.15-.57.14-.74-.61.61-1.68-.41-2.57-.43-.81-1.09-.92-1.48-1.7.3-.29.73.17.73.17a1,1,0,0,0-.07-1.17c.18.08.31,0,.52-.15-.07-.32-.72-.18-.46-.63a3,3,0,0,1,.8.29c-.21-.37-.58-.74-.76-1.13.33-.12.52.22.74.35-.16-.44-.33-1.14-.87-1.27l-.19.3c0-.17.46-.1.56,0,.43.37-.17.55-.37.58l-.13-.28c-1.13.34.2,1.15.19,1.72l-.85-.2.73.55c-.21.14-.66.26-.81,0-.38.44.32.35-.11.73a.11.11,0,0,1-.15,0l.28.39c-.18-.07-.58.1-.48-.15-.43.77.7,1.13.09,1.45l-.05-.05c.35,1,.61,0,1.4.73l-1.44.66.62,0c0,.11,0,.32-.28.31.46.34.25-.1.67.08-.49.57.42,1.35-.53,1.58.48.12.3-.52.68,0-1,.29.24.59-.15,1.11-.56-.06-.35-.54-.75,0,.95.14-.05.92.19,1.29.72-.1.43.79.78,1.39-.27,0-.16,1.28-.28,1.94h-.12c.74,0,.74.6,1,1a.85.85,0,0,1-.87-.16l.1.43a.71.71,0,0,1,.54.4l-.55,0c.15.57.92,1,.75,1.78.51-.09,1.23-.93,1.76-.28-.26.1-.71.26-.87.09,0,.06.28.17.2.33l-.53-.18c-.11.38.43.07.45.34-.38.1-.22.27-.53.31-.05-.05.1-.27-.08-.32a1.2,1.2,0,0,1-.37.93c.21-.09.51-.15.62.05.18.55-.41.33-.5.71.31,0,.15.49.72.32.05.16-.2.28-.34.39.35.2.52,1.31,1,.78l0-.08,0,0h0c.84.73.35,2,.95,2.83l-.18.07c.42.45.58,1.16,1.14,1.36.07.16-.16.51-.41.54.33.34.55.29.52,1-.5-.26-.22.27-.42-.31.08.59-.15.85.6,1.19-.54,0-.4.67-.13.85l.14-.52a2.51,2.51,0,0,1,.38.77l-.67.16c-.14,1.45,2.2,1.27,1.48,2.71.56,0-.05-.72.57-.75.19.51-.34,1.48-.25,1.63.08.85,1.2.11,1.38.91a.81.81,0,0,1,1.13-.26c.23.49-.46,1.09-.81.91-.09-.1-.06-.19,0-.23-.17-.1-.39-.24-.48.08l.23-.07c-.05.36.4,1,0,1,.42.22.42-.07.35-.39.11.78.61.92.83,1.65,0-.17.21-.42.27-.32.37,1,.64.12,1.14.63,0,.54-.78.4-.1.79.07.5-.44.46-.71.43.77.25.52,1.18.69,1.54l-.37-.16a1.27,1.27,0,0,1,.44.37l.24-.45c.06.21.18.35,0,.47.38,0,.51-.62,1.11-.57,0,.36.73.46.31.94-.39-.79-.42.48-1,0a.6.6,0,0,1,.33.4.15.15,0,0,1-.19,0c.11,1,.79-.17,1.33.49-.33.15-.37.6-.22.65-.22-.27.33-.51.74-.46.17.59.56.3.73.53l-.13-.33c.34-.16.49.07.83.27-.18.21-.37-.12-.37.06.74-.12.18,1.14.88,1.27,0,.37-.46.49-.4.78.8.13.17.85.95,1.06.18-.48.08-.42.75-.42l-1.05-.55h1c-.24-.24-.73-.28-.82-.48.52,0,.41,0,.57-.37-.16.83,1,.34,1,1.05l-.82.85c.23,1,1.48.55,2.07,1.46l-.12-.37c.42-.26.54.38.92.46-.28.28-.21.53-.26.81.17-.23.58.52,1.16,0l0,.7c.54.7,1.46-.28,2,.33-.45.19-.33.64-.95.54.21.18.36.39.53.17,0,.3.94,0,.92.47.19-.07.47-.38.69-.18a.33.33,0,0,1-.11.16c.11-.16.54.06.58-.45-.05,1.52,1.95,1.25,2,2.53.57.22,1.24.5,1.72.74-.09.08-.11.17-.17.08.44.7,1-.73,1.48.05,0,.77-.56.07-.45.41-.56,1.18,1,.39,1.08,1.31h-.16c.17.59,1.18.08,1.75.51a.34.34,0,0,0-.09.17,3.86,3.86,0,0,1,2.33,0c-.41.36-.39.1-.51.62.31.07.3-.78.9-.64,0,.34.33.75.14,1.28l-.52-.24c0,.77.67.32.89.56l-.17.27c.85.28,1.2-.43,2,0v-.26c.79-.49.21.58.91.27l-.17.78a9.35,9.35,0,0,1,2-.14,4.88,4.88,0,0,1-1.87.55c.31.14,1.09.4,1.4.11-.15,0-.39.13-.47,0a1.86,1.86,0,0,1,1.86-.21c-.69,1.38,1.48,1,1.52,2.28,1.32-.1,2.16,1,3.52,1.4-.1-1.28.4.09.7-1.09.33,0,.44.08.44.16l.71,1c.12.41-.37.17-.42.44.65.3.13.58.48,1,0-.45.42-.52.77-.25l-.39-.71c1.14-.33.53,1.23,1.68.9l-.41.28c.56-.08,1.84.55,2.58-.29.05.16.08.52-.16.54,1.16.47,2.9-.32,3.69.48l-.16.27c.24,0,.51-.46.72-.1,0,.12-.15.27-.05.31s.71-.37,1-.13l-.32.27c1.09.64,2-.42,3-.41-.18.87.69,1.32,1.13,1.55l0,.12c1.35.38,2.46-.28,3.79-.41.63,1.08,2.6.81,3.8,1.52-.17-.18.13-.67.36-.73.28.21.91-.5.76.29l-.11,0c.12.81.77.68,1.24.77l.21-1c1.08,1.67,3.34-.19,3.89,1.24.32-.24.7-.2,1-.43l-.06.56a6.05,6.05,0,0,0,2.29.28l-.24.38c.59.09.87-1.57,1.41-1.56l.1.86c1,.05,2,.87,3.07.15,0,.12-.06.37-.23.39.48.05,1.84.67,1.72-.5,0,.76,1.05.12,1.62-.19l-.11.55c.49-.69.51-.89,1.17-1.06.15.08.12.45-.08.3.5.31.42-.51,1-.2l-.24.35c.52.06.49-.13.79-.54.33-.22,1,.16,1.06.67.08-.31.37-.71.68-.56a.36.36,0,0,1-.13.36c.88.39,1.32-.63,1.92-.08a.54.54,0,0,0,.1.34,4.68,4.68,0,0,1-1.21-.1c0,.51.56.61.1,1.31.46-.38,1.24-1.21,1.8-1a1.13,1.13,0,0,1,.07.18l-.06.06a.34.34,0,0,0,.35-.09,1.1,1.1,0,0,0,.46.16c.07.42.65.23.94.25,0-.56.34-.47,0-.94.05,0-.05.07-.24.09a.45.45,0,0,0-.12.06l0-.05-.7,0c.22-.29.45-.53.77-.21a9.72,9.72,0,0,1,.39-.91c.38.78,1.13,1.19,1.24,1.68.87-.32,2-.25,2.56-1.31.24-.15.29.29.38.46-.14.11-.31.09-.38.25.49-.28,1.45-.15,1.55-.89.62.31-.33.69.51.54l-.1.23c1.72,1.12,2.63-2,4.54-.57-.13-.09-.2-.13-.23-.25,2.15.55,4.28-.89,6.44,0,.61.16.63-.31,1-.7l.18.59.55-.75c.82-.59,1.66,1.33,2.66.24l-.18-.38c.4,0,1.22-.39,1.21.09,0-.08.08-.44.26-.25l.05.32.9-.66c.79.13,0,1.26,1.16,1.17.4-.17,1.05-1.08.86-1.26a.53.53,0,0,1-.51-.45l.35-.21c-.08-.94.05-1.91-.91-2.43l-.54.65-.26-.42.51-.1c-.35-.38-.49,0-.66.3a.77.77,0,0,0-.33-.46l-.5,1c-.12-.36.19-.76-.25-.9-.24.44.38.77-.07,1.1-.35-.38-.3-.74-.61-.34a.44.44,0,0,1,.11-.51c-.28.32-.82.22-.92.73-.37-.49-1.05.25-1.11-.64a1.7,1.7,0,0,1-.77.82c.43-1.11-1.08,0-1.05-1.1-.3,1-1.37.54-2,1.13,0-.08.1-.24.16-.19-.39-.05-.53-.33-.79-.49,0,.79-.58,1-.88,1.52-.53-.72.22-.94,0-1.65.07.63-.78.69-.58,1.21-.4-.44-.33-.21-.57-.84,0,1-.33.19-.59.81-.56-.45-.2-.91-.76-.57C372.34,274.93,372.83,274.56,372.83,274.56ZM359,276.67v0l.29,0Zm-1.17,0a3.94,3.94,0,0,0,.51,0c0,.2,0,.4-.13.39C358.31,277,358,276.83,357.86,276.67Zm2.49,3.9c-.19.08-.26,0-.28-.15a1.8,1.8,0,0,0,.33-.06l0-.07A1.42,1.42,0,0,1,360.35,280.57Z"
                    />
                    <path className="color" d="M360.68,279.83l.08,0-.11-.12-.07.17Z" />
                    <path className="color" d="M270.74,233.67v0a.13.13,0,0,1,.06-.07Z" />
                    <polygon className="color" points="341.86 274.74 341.85 274.88 341.96 274.77 341.86 274.74" />
                    <path className="color" d="M270.85,226.92a.33.33,0,0,0,.13-.11S270.9,226.87,270.85,226.92Z" />
                    <path className="color" d="M270.42,224.2l.13-.42A2,2,0,0,0,270.42,224.2Z" />
                    <path className="color" d="M270.35,222.07h0Z" />
                    <path className="color" d="M284.6,251.47a.18.18,0,0,0,.07.05C284.88,251.58,284.76,251.51,284.6,251.47Z" />
                    <path className="color" d="M277.59,244.37a2,2,0,0,1,.39.13C277.92,244.33,277.86,244.21,277.59,244.37Z" />
                    <polygon className="color" points="293.16 258.23 293.15 258.24 293.21 258.28 293.16 258.23" />
                    <path className="color" d="M278.21,244.91a.43.43,0,0,0-.23-.41A.59.59,0,0,0,278.21,244.91Z" />
                    <path className="color" d="M269.81,212.94l0-.1h-.09Z" />
                    <path className="color" d="M269.74,212.83l-.07-.11A.1.1,0,0,0,269.74,212.83Z" />
                    <path className="color" d="M269.53,212.48l.14.24C269.67,212.63,269.69,212.53,269.53,212.48Z" />
                    <path className="color" d="M269.68,215.75h.21A.62.62,0,0,0,269.68,215.75Z" />
                    <path className="color" d="M269.8,216.59c0-.21.4-.54.25-.81l-.16,0C270.2,215.88,269.44,216.42,269.8,216.59Z" />
                    <path
                      className="color"
                      d="M267.65,220.43l.07-.75c-.2.15-.47.35-.56,0C266.62,220.7,267.62,219.46,267.65,220.43Z"
                    />
                    <path className="color" d="M267.64,222.73c-.16-.37-.31.06-.43.05C267.44,223,267.5,223.06,267.64,222.73Z" />
                    <path className="color" d="M272.19,238.66l-.48.17C271.9,239.08,271.89,238.75,272.19,238.66Z" />
                    <polygon className="color" points="275.91 240.34 276.06 239.94 275.58 240.03 275.91 240.34" />
                    <polygon className="color" points="273.56 243.69 273.43 243.6 273.83 243.97 273.56 243.69" />
                    <path className="color" d="M292.91,264.08l.27-.58C292.94,263.48,292.51,264.05,292.91,264.08Z" />
                    <path className="color" d="M303.79,269.35c0,.34.21.67.53.48C304.09,269.67,303.94,269.34,303.79,269.35Z" />
                    <polygon className="color" points="338.2 279.43 337.94 279.61 338.41 279.49 338.2 279.43" />
                  </g>
                </g>

                {/* port 2 extensor circle */}
                <g className="mixBlendModeMultiply">
                  <g>
                    <path className="alternativeColor" d="M361.21,315.35c.08.16.38.17.45-.21l-.39-.41Z" />
                    <path
                      className="alternativeColor"
                      d="M362.89,313.17c-.05-.5-.24-1.14-.78-1,.28.6,0,.62.41,1.28-.07.38-.36.58-.51.47.08.17-.29.53-.06.83a1.69,1.69,0,0,0,.64-1.68C362.75,312.93,362.82,313.11,362.89,313.17Z"
                    />
                    <path className="alternativeColor" d="M391.31,291.62l-.24,0A.69.69,0,0,0,391.31,291.62Z" />
                    <path
                      className="alternativeColor"
                      d="M413.51,290.41c-.17,0-.25,0-.27,0C413.41,290.46,413.54,290.47,413.51,290.41Z"
                    />
                    <path className="alternativeColor" d="M417,292l-.2-.09C416.89,291.93,417,292,417,292Z" />
                    <path className="alternativeColor" d="M391.31,291.62l.62-.05C391.92,291.4,391.6,291.55,391.31,291.62Z" />
                    <path className="alternativeColor" d="M364.07,307.94a1.27,1.27,0,0,0-.07.36c0-.1.08-.2.13-.3Z" />
                    <path className="alternativeColor" d="M382.26,295.92l-.17.08a1.58,1.58,0,0,0,0,.25Z" />
                    <path
                      className="alternativeColor"
                      d="M375.63,299.68c.15-.08,0-.46-.07-.66a.59.59,0,0,1-.16.46A.8.8,0,0,0,375.63,299.68Z"
                    />
                    <path className="alternativeColor" d="M366.45,307.36l-.06.22Z" />
                    <path className="alternativeColor" d="M387.31,293.71a.42.42,0,0,0,.13.11A.21.21,0,0,0,387.31,293.71Z" />
                    <path
                      className="alternativeColor"
                      d="M400.27,289.65a.22.22,0,0,0,0,.08C400.32,289.69,400.34,289.66,400.27,289.65Z"
                    />
                    <path className="alternativeColor" d="M408.69,294l-.13,0a2.12,2.12,0,0,0-.11.21Z" />
                    <path className="alternativeColor" d="M423.12,295.19l0,0C422.91,295.13,423,295.17,423.12,295.19Z" />
                    <path
                      className="alternativeColor"
                      d="M409.11,336.92c.81.18-1,.76.14.9C409.11,337.68,410.06,336.93,409.11,336.92Z"
                    />
                    <path className="alternativeColor" d="M364.23,307.79c.06-.09.11-.19.18-.28A1.13,1.13,0,0,0,364.23,307.79Z" />
                    <path className="alternativeColor" d="M409.25,337.82Z" />
                    <path className="alternativeColor" d="M434.49,305.1a.4.4,0,0,0,.09-.21S434.52,305,434.49,305.1Z" />
                    <path className="alternativeColor" d="M427.05,296.51l.22.2A1.28,1.28,0,0,0,427.05,296.51Z" />
                    <path className="alternativeColor" d="M436.45,310.51a.55.55,0,0,0,0,.41l0-.06A.32.32,0,0,1,436.45,310.51Z" />
                    <path className="alternativeColor" d="M435.55,316.68a.87.87,0,0,0,.11-.09l0-.2Z" />
                    <path
                      className="alternativeColor"
                      d="M379.61,293.25a1.31,1.31,0,0,1,.44.23C379.83,293.25,380.74,292.76,379.61,293.25Z"
                    />
                    <path className="alternativeColor" d="M364.28,308.06a.27.27,0,0,1,0-.27l-.1.21A.13.13,0,0,0,364.28,308.06Z" />
                    <path className="alternativeColor" d="M439.77,310.71l-.07,1.19A10.31,10.31,0,0,0,439.77,310.71Z" />
                    <path className="alternativeColor" d="M365.56,334.4l-.22-.14A.34.34,0,0,0,365.56,334.4Z" />
                    <path
                      className="alternativeColor"
                      d="M439.31,315.34a2.1,2.1,0,0,0-.42.57.41.41,0,0,0,.07.15C439.08,315.82,439.21,315.58,439.31,315.34Z"
                    />
                    <path className="alternativeColor" d="M380.05,293.48Z" />
                    <path
                      className="alternativeColor"
                      d="M386.6,290.27c-1,.26-.34.65-.48,1-1.15.48-.66-.24-1.15-.4-.71.37-1.12,1-1.68,1.19-.06-.07-.18-.07-.09-.22-.64.66-2.3.82-3,1.71a.27.27,0,0,1-.17-.09,1.18,1.18,0,0,1,.42.65c-.42.18-.64.65-1,.39.27-.1.23-.25.31-.4l-.38.33c-.61-.3.53-.43.38-.78a12.1,12.1,0,0,1-2.34,1.57c-.37-.4,1.47-.89.39-.88.37-.1.74-.21,1.11-.3-1.12-.38.66-.23-.43-.69-1.44.5-1.43.94-2.83,1.53-.16.41.3.31.14.72a1.83,1.83,0,0,1-1.76.63,1.07,1.07,0,0,0-1.32.59c-.15.52.1,1.12-1,1.53l-.05-.7c-1.21.88-.15,1.16-1.56,1.86.05-.35.75-.89.54-.8-1.06.3-.33.7-.89,1.21l-.46-.26a29.36,29.36,0,0,0-2.95,4.11c-.06-.17,0-.5-.38-.27-1.12,1.9-2.62,3.87-3.78,5.7l.08.92c-.07.17-.32.25-.31,0-.48.7.23.14.24.57s-.45.49-.47.16a20.74,20.74,0,0,1-1.26,5.53l-.07-.32c-.41,1.15.64,1.47.09,2.48l-.05-.21c-.53,2.54-.2,5.29-.41,7.5.35.14.43.82.62,1.48s.52,1.28.94,1.14a12.77,12.77,0,0,1,.28,1.41,5.37,5.37,0,0,0,.74,1.74c.3.49.94.34,1.47.79l-.34.32,1,.38c0,.26,0,.49,0,.74l.56.38c-.17-.2-.26-.54-.13-.6.84.58,1.62,1.9,1.5,2.1.7.44,1.46.76,2.18,1.13-.14.12-.51-.06-.84-.15,1.33.34-.1.57,1.15.84-.08-.17.22-.19.29-.25a3.83,3.83,0,0,0,1,.87,10.5,10.5,0,0,0,1.45.68l-.31.2a27.85,27.85,0,0,0,5.41,2c-.64-.36-.31-.84.24-.72l.08.54c.44-.18-.51-.36.31-.48.69.23.33.66-.12.7l.9.06c0,.16-.2.18-.31.35.43-.2,1.4.87,2,.45v.15a33.83,33.83,0,0,0,4.43.53c.08-.41.68-.24,1.18-.54a18.31,18.31,0,0,0,3.8.66c1-.19.29-.35.74-.59.06.38,1.45.37.73.64a21.46,21.46,0,0,0,4.22-.5c-.24-.15-.5-.21-.37-.35.37-.07.87.11.82.3l-.09.05c2.28-.71,5.54.61,7.3-.5l-.1.06c.62-.24,1.23-.5,1.85-.75.89-.09-.48.38.22.5,1.93-1,3.27-.57,4.86-1.41,1.6.79,4.56-1.35,6.49-1.3l-.19-.21c.36-.41.59-.05.94-.12-.12-.17-.56-.05-.34-.28,3.61-1.71,7.78-3,11.34-5.38,1.29-.9-.14-1.57,1.71-2.37l-.09.74c.48-.64,1-1.19,1.57-1.78s1.06-1.17,1.61-1.75,1-1.23,1.47-1.86a14.06,14.06,0,0,0,1.13-2c0,.21.12.29-.05.54.71-.32,1.23-2.08,1-2.21.25-.4.28,0,.56-.16.51-.49.27-1.69.74-1.85.08,0,0,.21,0,.33a5.8,5.8,0,0,1,.35-1.05c.11-.38.16-.67-.1-.55a5.37,5.37,0,0,0,.54-1.56,4.53,4.53,0,0,1,.43-1.42c-.3-.68.58-1.93,0-2.21.66.18.78-2,.41-2.75.2.25.22-.66.5-.37,0-.88-.26-1.69-.58-1.49a3,3,0,0,0-.31-2.29c-.34-.65-.59-1.2-.28-1.8a23.31,23.31,0,0,0-4.37-5.63c.6-.42,1.61,1.85,2.11,1.37-1.53-1.6-2.78-2.05-4.18-3.55-.34-.41.42,0,.64,0-1.73-1.2-3.1-2.59-4.84-3.26,0-.05.24,0,.42.06-.31-.18-.65-.54-.78-.26l.34.12c.24.67-1.69.06-1.86.24,1-.47-1.41-1.06,0-1.56-.23-.06-.56-.08-.61.13-.28-.22-.32-.38.1-.42-1.2-.45-.95.05-2-.48.07-.13.3-.08.49-.18a3.57,3.57,0,0,1-2.13-.51c.09-.06,0-.21.31-.09-1.56-.67-2.91-.42-4.53-1.27.72-.45-.52-.39-.45-1l-1-.14.31.38c-.83-.28-1.68,0-2.35-.39l.68-.07c-.53-.09-1.06-.21-1.6-.26a9.37,9.37,0,0,1,.85.4c-.91.08-.06.69-1.14.32.24,0-.82-.16-1.21-.57h0a2.45,2.45,0,0,1-1.5,0c-.14-.2.21-.6.12-.73-.24.21-.74.17-1.26.15a2.29,2.29,0,0,0-1.33.23.42.42,0,0,0,.16-.46l-.37.35c-.39-.15-.45-.21-.37-.44-1.19-.12.35.71-1.05.38.11,0,.06-.09.29-.15-1.42-.2-2.74.25-4,.12-.43-.55,1.13-.18.66-.64a20.76,20.76,0,0,0-2.86.59,17.17,17.17,0,0,1-2.78.61h.34c-.1.83-1.4-.13-2.23.43.21-.12.2-.49.16-.4a15.38,15.38,0,0,0-4.17,1.6l.16-.26a19.18,19.18,0,0,0-2.64.71c-.15.27-.58.41-.22.58-2.73-.16-4,2.39-6.33,2.4.23-.12.48-.42.3-.34l-1.58,1c.28.25.31.08.77.16a2,2,0,0,1-.92.85c.64-.56-.25-.51-.65-.51.1.07,0,.23.12.31-1.13-.12.17.69-1.18.92l0-.2c-.39.3-.67.74-1.15.94-.38-.24.36-.41.24-.72-.64.39-.91,1.36-1.68,1.36.2-.27.6-.48.82-.73a1.93,1.93,0,0,0-1.39.31l0,0-1.19.48.34-.06c-.24,1.35-1.5,1.2-2.13,2.47.61-1.23-.06-.43-.25-.85-.33.09-.81.28-.77.09-.26.66-1,.37-1.33,1.33-.12-.08-.5.41-.63,0-.53.61.31.08.37.26-.28.6-.94.9-1.58,1.38a3.83,3.83,0,0,0-1.64,1.87c-.8,1.31-.53,1.86-1.14,3.08-.47.23-.21-.61-.21-.61A3,3,0,0,0,365,308c0-.19-.21-.12-.46,0-.26.51.23.57-.3,1.13a1.84,1.84,0,0,1-.24-.79c-.22.66-.27,1.39-.47,2.06-.31.06-.15-.54-.19-.84a12.47,12.47,0,0,0-.41,1.3,1.49,1.49,0,0,0,0,1l.32-.4c-.09.26-.37,0-.36-.23,0-.76.54-.82.68-.79l-.14.48c1-.07.73-1.82,1.32-2.65l.32.66.09-1.11c.25-.1.62,0,.45.42.62-.42.13-.64.74-1,.08,0,.09,0,.07.08l.25-.64c0,.18.43.16.11.44,1-.74.78-1.84,1.46-1.87l0,.1c.94-1.39-.24-.42.2-1.74.46,0,.95.12,1.41.18l-.21-.44c.14-.1.41-.32.49-.14.24-.68-.22-.07-.16-.55.87-.28,1.62-1.67,2.22-1.24,0-.47-.78.31-.25-.46.68.46.74-.73,1.56-.9.06.46-.64.72.18.56-.05-.85,1.29-.72,1.73-1.18-.28-.49,1.05-.94,1.88-1.65,0,.19,1.91-.75,2.89-1l0,.1c-.08-.57.88-1,1.51-1.4.12.32.05.49-.24.8l.63-.31c.07-.23.23-.41.62-.67l0,.45a9.63,9.63,0,0,1,2.73-1.5c-.09-.38-1.32-.57-.25-1.34.13.17.32.48.05.69.09-.07.29-.31.53-.32l-.33.52c.57-.08.15-.38.57-.53.11.27.38.06.42.3-.09.07-.41,0-.51.22a2.41,2.41,0,0,1,1.37-.11c-.1-.14-.16-.37.16-.55.86-.38.44.2,1,.14.13-.28.76-.3.61-.72.26-.1.38.07.52.14.37-.36,2.1-.81,1.43-1.07h-.13l.07-.05h0c1.37-.95,3.23-.76,4.71-1.31l0,.15a17.5,17.5,0,0,0,2.63-1c.28,0,.7.17.61.36a2.88,2.88,0,0,1,1.81-.27c-.69.33.27.18-.71.27.94,0,1.16.25,2.12-.26-.31.41.72.42,1.15.3l-.66-.24a7.12,7.12,0,0,1,1.37,0l-.22.51c1.84.53,3.42-1,4.79.1.52-.31-1-.31-.53-.69.88.11,1.69,1,1.95,1,1.12.42,1.2-.58,2.39-.16-.12-.21-.19-.7.78-.69.86.24.88,1,.32,1-.2,0-.29-.11-.27-.17-.29,0-.66,0-.36.27l.14-.15c.39.25,1.54.54,1.2.75.67,0,.34-.22-.11-.43,1,.5,1.68.44,2.71,1-.14-.15-.24-.4-.07-.34,1.53.71.81-.09,1.92.23.51.48-.45.52.71.71.57.44-.05.49-.36.53,1.09.07,1.67,1,2.17,1.26l-.55-.08a2.35,2.35,0,0,1,.81.28l-.12-.46c.26.2.51.32.43.45.41-.06,0-.64.78-.63.31.35,1.26.44,1.18.92-1.13-.77-.09.49-1.14,0a1.84,1.84,0,0,1,.71.38c0,.07-.08.07-.17.05.92,1,.77-.2,1.93.47-.27.15,0,.59.23.66-.46-.28,0-.52.53-.44.63.62.87.37,1.24.63l-.38-.36c.29-.13.65.12,1.19.4-.07.19-.53-.19-.41,0,.82,0,1,1.25,1.87,1.57.22.4-.28.41-.07.73,1,.4.62,1,1.54,1.48,0-.47-.07-.45.71-.18-.47-.35-.95-.69-1.46-1a11.74,11.74,0,0,1,1.19.37c-.37-.39-1-.58-1.19-.84.6.13.51.16.5-.23.22.87,1.31.76,1.68,1.62l-.66.6a3.69,3.69,0,0,0,1.19,1.29c.24.19.48.39.73.63a3.78,3.78,0,0,1,.6.91l-.16-.52c.41,0,.61.8.95,1.2-.28.1-.22.44-.29.71.22-.13.45,1,1.05.95a4.42,4.42,0,0,1-.12.8c.23,1.23,1.21,1.19,1.35,2.49-.39-.33-.49.25-.87-.52.08.4.08.76.27.75-.18.24.52,1.09.2,1.5.13.17.44.23.41.72-.06.05-.15,0-.15,0,.17,0,.16.76.52.36a5.11,5.11,0,0,0-.73,2.44,3.49,3.49,0,0,1-.85,2.22,15.51,15.51,0,0,1-.83,2.8c-.06-.08-.13-.06,0-.19-.74.94.52,1-.42,2.11-.75.38.12-.76-.25-.46-1-.31-.62,1.5-1.65,1.93l.07-.21a1.88,1.88,0,0,0-.63,1.05,4,4,0,0,1-.75,1.38s0-.09-.11-.09c-.05.94-1,2.11-1.64,3,0-.52.2-.5-.21-.63-.31.39.56.36-.09,1.11-.39.07-1,.41-1.38.16l.66-.63c-.71-.08-.86.8-1.29,1.06l-.1-.22c-1,.94-.71,1.39-1.95,2.28l.23.05c-.35,1-.77.12-1.23.94l-.53-.36-.91,1a8.77,8.77,0,0,1-1.28,1.06,4,4,0,0,1,.78-1c.32-.34.64-.71.87-1-.23.14-.61.4-1,.66s-.66.49-.72.69c.17-.16.34-.41.58-.43a4.52,4.52,0,0,1-2,1.83c-.29-1.08-2.75.87-3.8.35-1.65,1.08-3.65,1.09-5.78,1.75,1,.65-.63.2-.26,1.05-.49.19-.69.22-.76.18-.56-.05-1.12-.09-1.68-.16s.44-.3.35-.49c-1.13.18-.56-.28-1.34-.35.22.29-.29.56-.95.56l1,.22c-1.47.8-1.5-.45-3,.3l.45-.37c-.78.32-3,.5-3.7,1.32-.16-.08-.38-.31,0-.42-2,.17-4.31,1.25-5.88.87l.14-.23c-.36.08-.62.44-1.09.24,0-.1.14-.23,0-.24a2.61,2.61,0,0,1-1.46.29l.41-.25c-1.91-.27-2.94.6-4.58.67,0-.65-1.44-1-2.17-1.16l0-.09c-2.17-.33-3.77,0-5.85-.18-1.06-1-4.05-1.46-5.68-2.7.22.23-.26.45-.62.36-.36-.33-1.38-.19-1-.69l.14.08c-.05-.66-.92-1-1.54-1.41l-.54.6a3.63,3.63,0,0,0-1.09-1.31,15.06,15.06,0,0,0-1.42-1.07,11.32,11.32,0,0,1-1.23-1,1.6,1.6,0,0,1-.46-1.09c-.48-.21-.79-.7-1.23-.95l.36-.23c-.36-.53-.54-1-.81-1.41a10.79,10.79,0,0,1-.75-1.41l.38.14c-.21-.65-1.47-.58-1.64-1.41l.59-.33c-.21-1.5.39-3.09,0-4.72a.37.37,0,0,1,.27.36c.05-.76.79-2.79-.1-2.68.55.08.36-1.61.38-2.53l.36.24a2.54,2.54,0,0,1-.26-2c.13-.22.38-.1.18.18.46-.71-.17-.74.39-1.61l.12.45a1.42,1.42,0,0,0,.08-1.32c0-.57.79-1.44,1.17-1.38a1,1,0,0,1,.12-1.15c.16,0,.15.21.15.31.92-1.09.65-2.08,1.54-2.66a.29.29,0,0,0,.3,0c-.65.91-1.12,1.68-1.1,1.59.32.19.85-.52.93.36.11-.74.27-2.14,1-2.72a.53.53,0,0,1,.18,0l0,.1a1,1,0,0,0,.28-.48,3.16,3.16,0,0,0,.55-.47c.3.12.79-.65,1.1-1-.34-.26.12-.64-.51-.48.07,0,0,.09-.21.32a1.12,1.12,0,0,0-.1.18v-.05c-.2.22-.44.52-.71.86a1.13,1.13,0,0,1,.68-1,7.19,7.19,0,0,1-.06-.93c.86-.06,1.94-.63,2.3-.46.85-1.1,2.37-2.12,2.68-3.25.28-.31.51-.06.7,0-.15.18-.39.31-.42.48.54-.61,1.93-1.28,1.84-1.85,1-.25-.25.72.92,0l-.09.23a6.61,6.61,0,0,0,3.16-1.71,5.07,5.07,0,0,1,3.6-1.34c-.22,0-.33,0-.4-.08,1.72-.3,3.39-.88,5.11-1.32a12.42,12.42,0,0,1,5.19-.42c1,.13,1-.24,1.64-.51l.2.46,1-.51c1.48-.29,2.35,1.25,4.2.85l-.18-.33c.64.13,2.06.24,1.88.55.07,0,.28-.27.49-.05l0,.24c.55,0,1.1,0,1.65,0,1.13.54-.45.84,1.22,1.43.65.14,2,0,1.85-.22s-.6-.38-.54-.61l.63.1c.36-.61,1.11-1.1-.23-2.11-.4,0-.79,0-1.19,0l-.24-.43c.3.09.61.17.91.27-.4-.48-.83-.31-1.24-.24a.78.78,0,0,0-.34-.5c-.42.09-.84.22-1.24.34-.06-.3.62-.39-.06-.73-.58.16.32.72-.55.69-.44-.44-.23-.65-.91-.52-.05-.2.11-.28.37-.3-.6.09-1.48-.24-1.83.09-.49-.49-1.88-.19-1.74-.82a4.31,4.31,0,0,1-1.56.39c1-.73-1.93-.18-1.65-1-.73.69-2.57.3-3.78.83.07-.07.19-.19.31-.16a6.12,6.12,0,0,1-1.39-.28c0,.6-1.08.85-1.59,1.32-.92-.42.4-.77.06-1.26.11.46-1.39.71-1,1.05-.7-.21-.58-.05-1-.46.05.75-.57.24-1,.81-1-.13-.4-.61-1.35-.14C385.77,290.76,386.6,290.27,386.6,290.27Zm-20.05,13.6h0a4.77,4.77,0,0,0,.29-.42C366.78,303.54,366.69,303.66,366.55,303.87Zm-1.16,1.7c.14-.21.32-.46.5-.74a.2.2,0,0,1,.12.34C366,305,365.65,305.38,365.39,305.57Zm4.8-1.54c-.14.26-.26.28-.36.25.08-.11.18-.24.3-.42l0-.06A.49.49,0,0,1,370.19,304Z"
                    />
                    <path className="alternativeColor" d="M370.14,303.26l.06-.11-.19.07,0,.17Z" />
                    <path className="alternativeColor" d="M391,291.65h0a.17.17,0,0,1-.1,0Z" />
                    <polygon className="alternativeColor" points="363.76 332.83 363.83 332.76 363.64 332.68 363.76 332.83" />
                    <path className="alternativeColor" d="M380.47,294.66a.24.24,0,0,0-.18,0A.48.48,0,0,0,380.47,294.66Z" />
                    <path className="alternativeColor" d="M376.23,296.85l-.66.22A4.55,4.55,0,0,0,376.23,296.85Z" />
                    <path className="alternativeColor" d="M373,298.68a.45.45,0,0,0,0,.19h0Z" />
                    <path className="alternativeColor" d="M428.38,294l.13.06C428.85,294.19,428.63,294.09,428.38,294Z" />
                    <path
                      className="alternativeColor"
                      d="M411.81,288.45a3.69,3.69,0,0,1,.58-.09C412.09,288.27,411.85,288.22,411.81,288.45Z"
                    />
                    <path className="alternativeColor" d="M439.78,310.58h0v0Z" />
                    <path className="alternativeColor" d="M413.19,288.52a1.61,1.61,0,0,0-.8-.16A2.71,2.71,0,0,0,413.19,288.52Z" />
                    <path className="alternativeColor" d="M362.49,310.92l-.09.16a.1.1,0,0,1,.06.05Z" />
                    <path className="alternativeColor" d="M362.46,311.13l0,.2C362.46,311.25,362.49,311.17,362.46,311.13Z" />
                    <path className="alternativeColor" d="M362.36,311.76l.06-.43C362.37,311.47,362.29,311.63,362.36,311.76Z" />
                    <path className="alternativeColor" d="M365.07,306.64l-.09-.13A.31.31,0,0,0,365.07,306.64Z" />
                    <path
                      className="alternativeColor"
                      d="M365.93,305.39c-.24.27-.81.54-1,1l.08.11C364.92,306.17,365.94,305.82,365.93,305.39Z"
                    />
                    <path
                      className="alternativeColor"
                      d="M371.49,302.23c-.32.23-.67.44-1,.7.26,0,.6-.06.24.35C372.19,302.63,370.27,303.2,371.49,302.23Z"
                    />
                    <path className="alternativeColor" d="M374.55,300.15c-.48.42.15.19.17.29C375,300.09,375,300,374.55,300.15Z" />
                    <path className="alternativeColor" d="M399.24,290v.39C399.71,290.23,399.21,290.2,399.24,290Z" />
                    <polygon className="alternativeColor" points="404.27 287.54 403.76 287.32 403.54 287.68 404.27 287.54" />
                    <polygon className="alternativeColor" points="407.29 290.32 407.08 290.36 407.89 290.27 407.29 290.32" />
                    <path className="alternativeColor" d="M435.47,315.5l.5,0C436,315.14,435.47,315,435.47,315.5Z" />
                    <path className="alternativeColor" d="M425,330.74a1,1,0,0,0-1,.48C424.44,331,424.9,330.93,425,330.74Z" />
                    <polygon className="alternativeColor" points="370.18 333.56 370.57 333.64 369.93 333.35 370.18 333.56" />
                  </g>
                </g>

                {/* control module 1 port circle */}
                <g className="mixBlendModeMultiply">
                  <g>
                    <path className="alternativeColor" d="M148.06,406.86c.09.17.39.18.45-.21l-.38-.4Z" />
                    <path
                      className="alternativeColor"
                      d="M149.75,404.69c-.06-.5-.25-1.14-.78-1,.27.6,0,.62.41,1.28-.07.38-.36.58-.52.46.08.17-.29.54-.05.83a1.67,1.67,0,0,0,.64-1.67C149.61,404.45,149.67,404.63,149.75,404.69Z"
                    />
                    <path className="alternativeColor" d="M178.17,383.14l-.24,0A.69.69,0,0,0,178.17,383.14Z" />
                    <path className="alternativeColor" d="M200.37,381.93c-.17,0-.25,0-.27.05C200.26,382,200.39,382,200.37,381.93Z" />
                    <path className="alternativeColor" d="M203.88,383.47l-.2-.09C203.74,383.44,203.82,383.49,203.88,383.47Z" />
                    <path
                      className="alternativeColor"
                      d="M178.17,383.14c.2,0,.41-.05.62-.05C178.78,382.92,178.46,383.07,178.17,383.14Z"
                    />
                    <path className="alternativeColor" d="M150.93,399.46a1,1,0,0,0-.07.36c0-.1.08-.2.13-.3Z" />
                    <path className="alternativeColor" d="M169.11,387.44l-.16.08a.92.92,0,0,0,0,.25Z" />
                    <path
                      className="alternativeColor"
                      d="M162.49,391.2c.15-.08,0-.47-.08-.66a.52.52,0,0,1-.15.45A.6.6,0,0,0,162.49,391.2Z"
                    />
                    <path className="alternativeColor" d="M153.31,398.88l-.07.21Z" />
                    <path className="alternativeColor" d="M174.17,385.23a.33.33,0,0,0,.13.11A.24.24,0,0,0,174.17,385.23Z" />
                    <path className="alternativeColor" d="M187.13,381.17s0,.05,0,.07S187.19,381.18,187.13,381.17Z" />
                    <path className="alternativeColor" d="M195.54,385.5l-.12,0a2.12,2.12,0,0,0-.11.21Z" />
                    <path className="alternativeColor" d="M210,386.71l0,0C209.77,386.64,209.86,386.68,210,386.71Z" />
                    <path className="alternativeColor" d="M196,428.44c.81.18-1,.76.14.89C196,429.2,196.92,428.45,196,428.44Z" />
                    <path className="alternativeColor" d="M151.09,399.31c0-.1.11-.19.17-.29A1.39,1.39,0,0,0,151.09,399.31Z" />
                    <path className="alternativeColor" d="M196.11,429.33h.12Z" />
                    <path className="alternativeColor" d="M221.35,396.62a.5.5,0,0,0,.09-.21S221.37,396.48,221.35,396.62Z" />
                    <path className="alternativeColor" d="M213.91,388l.22.2A1,1,0,0,0,213.91,388Z" />
                    <path
                      className="alternativeColor"
                      d="M223.3,402a.67.67,0,0,0,0,.41.34.34,0,0,0,.06-.06A.32.32,0,0,1,223.3,402Z"
                    />
                    <path className="alternativeColor" d="M222.4,408.2a.54.54,0,0,0,.12-.09l0-.2Z" />
                    <path
                      className="alternativeColor"
                      d="M166.46,384.77a1.14,1.14,0,0,1,.44.23C166.69,384.76,167.59,384.28,166.46,384.77Z"
                    />
                    <path className="alternativeColor" d="M151.14,399.58a.25.25,0,0,1,0-.27l-.1.21A.13.13,0,0,0,151.14,399.58Z" />
                    <path className="alternativeColor" d="M226.63,402.23l-.08,1.19A10.14,10.14,0,0,0,226.63,402.23Z" />
                    <path className="alternativeColor" d="M152.42,425.92l-.23-.14A.38.38,0,0,0,152.42,425.92Z" />
                    <path
                      className="alternativeColor"
                      d="M226.17,406.85a2.84,2.84,0,0,0-.43.57.39.39,0,0,0,.07.16A7.05,7.05,0,0,0,226.17,406.85Z"
                    />
                    <path className="alternativeColor" d="M166.91,385h0Z" />
                    <path
                      className="alternativeColor"
                      d="M173.45,381.79c-1,.26-.34.65-.47,1-1.15.49-.66-.23-1.15-.39-.71.37-1.13,1-1.68,1.19-.07-.08-.19-.07-.1-.22-.63.66-2.3.82-3,1.7a.27.27,0,0,1-.17-.08,1.21,1.21,0,0,1,.42.65c-.42.18-.65.65-1,.39.26-.11.23-.25.3-.41l-.38.34c-.6-.3.54-.43.39-.78a12.41,12.41,0,0,1-2.34,1.57c-.37-.4,1.46-.89.38-.88.38-.1.74-.21,1.12-.3-1.13-.39.65-.23-.43-.69-1.44.5-1.43.94-2.83,1.53-.16.41.3.31.14.72a1.85,1.85,0,0,1-1.76.63,1.09,1.09,0,0,0-1.33.59c-.14.52.11,1.12-1,1.53l0-.7c-1.2.88-.14,1.16-1.55,1.86.05-.35.75-.9.53-.8-1.06.3-.32.7-.88,1.21l-.46-.26a27.82,27.82,0,0,0-2.95,4.11c-.07-.17,0-.5-.39-.27-1.11,1.9-2.61,3.87-3.77,5.7l.08.92c-.08.17-.32.25-.32,0-.48.7.24.15.25.58-.14.44-.45.49-.47.16a21.13,21.13,0,0,1-1.26,5.53l-.08-.32c-.4,1.15.64,1.47.09,2.48l-.05-.21c-.52,2.54-.19,5.29-.4,7.5.34.14.42.82.62,1.48s.51,1.28.94,1.14c.19.75.21,1.05.28,1.41a5.26,5.26,0,0,0,.73,1.74c.31.49.95.34,1.48.79l-.34.32,1,.38c0,.25,0,.49,0,.74l.55.38c-.17-.2-.25-.54-.13-.6.84.57,1.62,1.89,1.51,2.1.7.44,1.46.76,2.18,1.12-.15.13-.51,0-.85-.14,1.34.34-.09.57,1.16.84-.08-.17.22-.19.29-.26a3.6,3.6,0,0,0,1,.88,11.28,11.28,0,0,0,1.46.68l-.31.2a27.74,27.74,0,0,0,5.4,1.95c-.63-.35-.3-.83.25-.71l.08.54c.44-.18-.52-.36.31-.49.68.24.33.66-.13.71l.91.06c0,.16-.21.18-.31.34.43-.19,1.39.87,2,.45l0,.16a33.83,33.83,0,0,0,4.43.53c.08-.42.68-.24,1.18-.55a17.54,17.54,0,0,0,3.8.67c1-.19.29-.35.73-.59.07.38,1.45.37.73.63a20,20,0,0,0,4.22-.5c-.23-.14-.49-.2-.37-.34.38-.07.87.11.83.3l-.1.05c2.28-.71,5.55.61,7.31-.5l-.1.05c.62-.23,1.23-.49,1.84-.74.89-.09-.47.38.22.5,1.94-1,3.28-.57,4.86-1.41,1.61.78,4.56-1.35,6.5-1.3l-.19-.21c.36-.41.59-.06.94-.12-.12-.18-.57-.05-.34-.28,3.61-1.71,7.78-3,11.34-5.39,1.29-.89-.14-1.56,1.7-2.36l-.08.74c.48-.64,1-1.19,1.56-1.78s1.07-1.17,1.62-1.75,1-1.23,1.47-1.86a14.06,14.06,0,0,0,1.13-2c0,.21.12.29,0,.54.7-.32,1.23-2.08,1-2.21.26-.4.29,0,.57-.16.51-.49.26-1.69.74-1.86.08,0,0,.22,0,.34a6.13,6.13,0,0,1,.35-1.06c.11-.38.16-.66-.1-.54a6.16,6.16,0,0,0,.54-1.56,4.58,4.58,0,0,1,.42-1.43c-.3-.67.59-1.92,0-2.2.66.18.78-2,.41-2.76.2.26.22-.65.5-.36,0-.88-.26-1.69-.58-1.49a3,3,0,0,0-.31-2.29c-.35-.65-.59-1.2-.28-1.8a23.56,23.56,0,0,0-4.37-5.63c.6-.42,1.6,1.85,2.11,1.37-1.54-1.6-2.79-2.05-4.18-3.55-.35-.41.42,0,.63,0-1.72-1.19-3.1-2.58-4.84-3.25,0-.05.24,0,.43,0-.32-.17-.65-.53-.78-.25l.34.12c.24.67-1.69.05-1.86.24,1-.47-1.41-1.06,0-1.56-.24-.07-.56-.08-.62.13-.27-.22-.31-.38.11-.42-1.2-.45-.95.05-2-.48.08-.13.31-.08.49-.18a3.63,3.63,0,0,1-2.12-.51c.09-.06,0-.21.3-.09-1.55-.67-2.9-.42-4.52-1.27.72-.46-.53-.39-.45-.95l-1-.14.3.38c-.82-.28-1.67,0-2.34-.39l.68-.07c-.54-.09-1.06-.21-1.6-.26a9.2,9.2,0,0,1,.84.4c-.9.08-.06.69-1.13.32.23,0-.83-.16-1.21-.57h0a2.45,2.45,0,0,1-1.5,0c-.14-.2.21-.6.12-.73a2.11,2.11,0,0,1-1.25.15,2.29,2.29,0,0,0-1.33.23.42.42,0,0,0,.16-.46l-.38.35c-.38-.15-.44-.21-.37-.44-1.19-.12.35.71-1.05.37.12,0,.06-.08.3-.14-1.43-.21-2.74.24-4.05.12-.42-.55,1.14-.18.67-.64a20.76,20.76,0,0,0-2.86.59,17.4,17.4,0,0,1-2.78.61h.34c-.1.83-1.4-.13-2.23.43.2-.12.19-.5.15-.4a15.22,15.22,0,0,0-4.16,1.6l.16-.26a19.12,19.12,0,0,0-2.64.7c-.15.28-.58.42-.22.59-2.73-.17-4,2.39-6.33,2.39.23-.11.48-.41.29-.33l-1.57,1c.28.25.31.08.77.16a2,2,0,0,1-.92.85c.64-.56-.25-.51-.66-.51.1.06.05.22.12.31-1.13-.12.18.69-1.17.91l0-.19c-.4.3-.67.73-1.15.94-.39-.24.36-.41.23-.72-.64.39-.91,1.36-1.68,1.36.21-.27.61-.48.83-.73a1.93,1.93,0,0,0-1.39.31l0,0-1.2.48.35-.06c-.25,1.35-1.5,1.2-2.14,2.47.62-1.23-.05-.43-.24-.85-.34.09-.81.27-.78.09-.25.66-1,.37-1.32,1.33-.12-.09-.5.41-.63,0-.53.61.31.07.37.26-.29.59-1,.9-1.58,1.37a3.92,3.92,0,0,0-1.65,1.88c-.79,1.3-.52,1.86-1.14,3.08-.46.23-.21-.61-.21-.61a3,3,0,0,0-1.12,1.67c0-.19-.2-.12-.46,0-.25.51.23.57-.29,1.13a1.84,1.84,0,0,1-.24-.79c-.22.66-.27,1.39-.47,2.06-.32.05-.16-.54-.19-.84a12.42,12.42,0,0,0-.42,1.3,1.55,1.55,0,0,0,0,1l.33-.4c-.09.26-.38,0-.36-.23,0-.76.53-.82.68-.79l-.14.48c1-.07.73-1.82,1.32-2.65l.32.66.09-1.11c.25-.1.62,0,.44.42.63-.42.14-.64.75-.95.08,0,.09,0,.07.08l.25-.65c0,.19.42.17.11.45,1-.74.78-1.85,1.46-1.87l0,.1c.94-1.4-.25-.42.2-1.74.46,0,1,.11,1.41.18l-.21-.44c.13-.11.4-.32.48-.15.24-.67-.21-.06-.15-.54.87-.29,1.62-1.67,2.21-1.24,0-.47-.77.31-.25-.46.69.46.74-.73,1.57-.91.05.47-.64.73.17.57-.05-.85,1.3-.72,1.74-1.19-.29-.48,1.05-.93,1.88-1.64,0,.19,1.9-.75,2.89-1v.1c-.08-.58.89-1,1.52-1.4.12.31.05.49-.25.8l.64-.31c.07-.23.23-.41.62-.67v.45a9.69,9.69,0,0,1,2.74-1.5c-.09-.38-1.33-.57-.25-1.34.13.17.32.48,0,.69.09-.07.29-.32.53-.33l-.33.53c.58-.08.15-.38.57-.53.11.27.39.06.43.3-.1.07-.41,0-.52.22a2.45,2.45,0,0,1,1.38-.11c-.11-.14-.16-.37.16-.55.86-.38.44.2,1,.14.13-.28.76-.3.61-.72.25-.1.37.07.52.14.37-.36,2.09-.81,1.42-1.08l-.12,0,.06-.05h0c1.38-1,3.24-.76,4.71-1.31l0,.15a18.84,18.84,0,0,0,2.64-1c.28,0,.7.17.6.36a3,3,0,0,1,1.82-.28c-.69.34.27.19-.71.28.93,0,1.16.25,2.12-.26-.31.41.72.41,1.15.3l-.66-.25a8,8,0,0,1,1.37,0l-.22.51c1.84.53,3.41-1,4.78.1.53-.31-1-.32-.52-.69.88.11,1.69.95,1.95,1,1.12.42,1.19-.58,2.39-.16-.12-.21-.19-.7.78-.69.86.24.88,1,.32,1-.2,0-.29-.12-.27-.17-.29,0-.66,0-.37.27l.15-.15c.39.25,1.53.54,1.2.74.66,0,.34-.21-.11-.42,1,.5,1.67.44,2.71,1-.15-.15-.24-.4-.07-.35,1.53.72.81-.08,1.92.24.51.48-.45.52.7.71.58.43,0,.48-.35.53,1.09.07,1.67,1,2.17,1.26l-.55-.09a2.57,2.57,0,0,1,.81.29l-.13-.46c.27.2.51.32.44.45.4-.06,0-.64.77-.63.31.35,1.27.43,1.18.92-1.13-.77-.09.49-1.14,0a1.8,1.8,0,0,1,.72.38c0,.07-.09.06-.18,0,.93,1,.78-.2,1.94.47-.28.14,0,.59.22.65-.45-.27,0-.51.54-.43.63.61.87.37,1.24.63l-.38-.37c.29-.12.64.13,1.19.41-.08.19-.54-.19-.41,0,.82,0,1,1.25,1.86,1.56.23.41-.27.42-.06.74,1,.4.61,1,1.54,1.47,0-.46-.07-.44.71-.17-.48-.35-1-.7-1.46-1a11.74,11.74,0,0,1,1.19.37c-.37-.39-1-.58-1.19-.85.6.14.5.17.5-.23.21.88,1.31.77,1.67,1.63l-.65.6a3.52,3.52,0,0,0,1.19,1.29c.23.19.48.38.72.62a3.59,3.59,0,0,1,.6.91l-.15-.51c.41,0,.61.8.95,1.2-.28.1-.23.43-.29.71.22-.13.45,1,1.05.95a5.52,5.52,0,0,1-.12.8c.22,1.23,1.21,1.19,1.34,2.49-.38-.33-.49.25-.87-.52.08.4.08.76.28.74-.18.25.51,1.1.2,1.51.13.17.43.23.41.71-.06.05-.15,0-.15,0,.16,0,.15.76.52.36a5,5,0,0,0-.73,2.44,3.49,3.49,0,0,1-.85,2.22,15.75,15.75,0,0,1-.83,2.8c-.06-.08-.13-.06,0-.19-.74.94.52,1-.42,2.1-.76.38.12-.75-.25-.45-1-.31-.63,1.5-1.65,1.93l.07-.21a1.83,1.83,0,0,0-.63,1.05,4.1,4.1,0,0,1-.76,1.38s0-.09-.11-.09c-.05.94-1,2.11-1.63,3,0-.52.2-.51-.22-.63-.3.39.57.36-.09,1.11-.38.07-1,.41-1.38.16l.67-.63c-.71-.08-.87.8-1.29,1.06l-.11-.22c-1,.94-.71,1.38-1.94,2.28l.22.05c-.34,1-.76.12-1.22.94l-.54-.37-.91,1a7.9,7.9,0,0,1-1.28,1.07,4,4,0,0,1,.78-1c.32-.34.64-.71.88-1-.23.14-.61.4-1,.66s-.67.49-.72.69c.16-.16.34-.41.57-.43a4.43,4.43,0,0,1-2,1.83c-.3-1.09-2.75.87-3.8.35-1.65,1.08-3.65,1.09-5.78,1.75,1,.65-.63.2-.26,1.05-.5.19-.7.22-.76.18-.56,0-1.12-.09-1.68-.16s.44-.31.34-.49c-1.13.18-.55-.28-1.34-.35.22.29-.28.56-1,.56l1,.22c-1.48.8-1.5-.45-3,.3l.44-.37c-.78.32-3,.5-3.69,1.32-.16-.08-.39-.31,0-.42-2,.17-4.31,1.25-5.88.86l.14-.23c-.36.08-.62.45-1.09.25,0-.1.14-.23,0-.24a2.7,2.7,0,0,1-1.46.29l.41-.26c-1.91-.26-2.95.61-4.59.68,0-.65-1.43-1-2.16-1.16l0-.09c-2.17-.33-3.77,0-5.85-.19-1.06-1-4.06-1.45-5.69-2.69.23.23-.26.45-.62.36-.35-.33-1.37-.2-1-.7l.15.09c0-.67-.92-1-1.54-1.42l-.54.61a3.56,3.56,0,0,0-1.1-1.31,13.4,13.4,0,0,0-1.41-1.07,11.32,11.32,0,0,1-1.23-1,1.66,1.66,0,0,1-.47-1.09c-.47-.21-.78-.7-1.23-1l.36-.23c-.35-.53-.53-1-.8-1.42a8.76,8.76,0,0,1-.75-1.41c.12.06.25.1.37.15-.2-.65-1.47-.58-1.64-1.41l.59-.33c-.2-1.5.4-3.1,0-4.72a.36.36,0,0,1,.27.36c0-.76.8-2.79-.09-2.68.55.08.36-1.61.37-2.53l.37.24a2.59,2.59,0,0,1-.27-2c.13-.22.39-.1.18.18.46-.71-.16-.74.4-1.61l.12.45a1.49,1.49,0,0,0,.08-1.32c0-.58.78-1.44,1.17-1.38a1,1,0,0,1,.12-1.15c.16,0,.15.21.14.31.93-1.09.65-2.08,1.55-2.67a.29.29,0,0,0,.3,0c-.65.91-1.13,1.68-1.11,1.59.33.19.85-.52.94.35.11-.74.27-2.13,1-2.71a.47.47,0,0,1,.17,0l0,.1a.93.93,0,0,0,.29-.48,3.14,3.14,0,0,0,.54-.48c.31.12.79-.64,1.11-.95-.34-.27.12-.64-.51-.49.07,0,0,.1-.21.33a.62.62,0,0,0-.1.17v0c-.19.22-.43.52-.71.86a1.13,1.13,0,0,1,.69-1,7.54,7.54,0,0,1-.07-.93c.87-.06,1.95-.63,2.31-.47.84-1.09,2.37-2.12,2.68-3.25.27-.3.51,0,.7,0-.15.19-.39.32-.43.49.54-.61,1.94-1.29,1.85-1.85,1-.26-.25.71.92,0l-.09.23a6.66,6.66,0,0,0,3.16-1.71,5.06,5.06,0,0,1,3.59-1.35c-.22,0-.33,0-.4-.07,1.73-.3,3.4-.89,5.12-1.32a12.23,12.23,0,0,1,5.19-.42c1,.13,1-.24,1.63-.51l.21.46,1-.51c1.49-.29,2.36,1.25,4.21.85l-.18-.34c.63.14,2.06.25,1.88.56.07,0,.28-.28.49-.05l0,.23c.54,0,1.1,0,1.65,0,1.13.54-.45.84,1.22,1.43.64.14,2,0,1.85-.22s-.6-.38-.54-.61l.63.1c.35-.62,1.1-1.1-.23-2.12-.4,0-.79,0-1.19,0l-.24-.44c.3.1.61.17.9.28-.4-.48-.82-.31-1.24-.24a.71.71,0,0,0-.34-.5c-.41.09-.83.22-1.24.34-.06-.3.62-.39-.06-.73-.57.16.32.72-.55.69-.43-.44-.23-.65-.9-.52-.05-.2.11-.28.37-.3-.6.09-1.48-.24-1.83.09-.49-.49-1.88-.19-1.75-.83a4,4,0,0,1-1.56.4c1-.73-1.92-.18-1.65-1-.72.68-2.56.3-3.77.82.06-.06.19-.18.3-.15a6.37,6.37,0,0,1-1.39-.28c0,.6-1.08.85-1.58,1.32-.92-.42.4-.77.05-1.26.12.46-1.39.71-1,1.05-.69-.21-.57-.05-1-.46,0,.74-.57.23-1,.81-1-.13-.4-.62-1.34-.15C172.63,382.28,173.45,381.79,173.45,381.79Zm-20,13.6h0c.12-.18.23-.32.29-.42Zm-1.17,1.7.51-.74a.2.2,0,0,1,.12.34C152.85,396.54,152.51,396.89,152.24,397.09Zm4.81-1.55c-.15.26-.27.29-.36.26.08-.11.17-.25.3-.42l0-.06A.49.49,0,0,1,157.05,395.54Z"
                    />
                    <path className="alternativeColor" d="M157,394.78a.64.64,0,0,1,.06-.11l-.19.07,0,.17Z" />
                    <path className="alternativeColor" d="M177.88,383.16h.05a.35.35,0,0,1-.11,0A.16.16,0,0,1,177.88,383.16Z" />
                    <polygon className="alternativeColor" points="150.61 424.35 150.69 424.28 150.5 424.2 150.61 424.35" />
                    <path className="alternativeColor" d="M167.32,386.18a.21.21,0,0,0-.17,0S167.24,386.17,167.32,386.18Z" />
                    <path className="alternativeColor" d="M163.09,388.37l-.66.22A5,5,0,0,0,163.09,388.37Z" />
                    <path className="alternativeColor" d="M159.86,390.2a.64.64,0,0,0,0,.19h0Z" />
                    <path className="alternativeColor" d="M215.24,385.52l.13.07C215.7,385.7,215.49,385.61,215.24,385.52Z" />
                    <path className="alternativeColor" d="M198.66,380a4,4,0,0,1,.59-.09C199,379.79,198.71,379.74,198.66,380Z" />
                    <path className="alternativeColor" d="M226.63,402.1h0v0Z" />
                    <path className="alternativeColor" d="M200.05,380a1.61,1.61,0,0,0-.8-.16A2.65,2.65,0,0,0,200.05,380Z" />
                    <path className="alternativeColor" d="M149.35,402.44l-.09.16a.08.08,0,0,1,.05,0Z" />
                    <path className="alternativeColor" d="M149.31,402.65l0,.2C149.32,402.77,149.35,402.69,149.31,402.65Z" />
                    <path className="alternativeColor" d="M149.22,403.28l.06-.43C149.22,403,149.14,403.15,149.22,403.28Z" />
                    <path className="alternativeColor" d="M151.93,398.16l-.1-.14A.25.25,0,0,0,151.93,398.16Z" />
                    <path
                      className="alternativeColor"
                      d="M152.79,396.91c-.24.27-.81.53-1,1l.07.1C151.78,397.69,152.8,397.34,152.79,396.91Z"
                    />
                    <path
                      className="alternativeColor"
                      d="M158.35,393.74c-.32.24-.67.45-1,.71.26,0,.6-.06.25.34C159.05,394.15,157.13,394.72,158.35,393.74Z"
                    />
                    <path
                      className="alternativeColor"
                      d="M161.41,391.67c-.49.42.14.19.17.28C161.83,391.61,161.89,391.52,161.41,391.67Z"
                    />
                    <path className="alternativeColor" d="M186.09,381.48v.39C186.56,381.74,186.07,381.72,186.09,381.48Z" />
                    <polygon className="alternativeColor" points="191.13 379.06 190.62 378.84 190.39 379.2 191.13 379.06" />
                    <polygon className="alternativeColor" points="194.15 381.83 193.93 381.88 194.75 381.79 194.15 381.83" />
                    <path className="alternativeColor" d="M222.33,407l.49,0C222.82,406.66,222.32,406.48,222.33,407Z" />
                    <path
                      className="alternativeColor"
                      d="M211.89,422.26a1,1,0,0,0-1,.48C211.3,422.54,211.76,422.45,211.89,422.26Z"
                    />
                    <polygon className="alternativeColor" points="157.04 425.08 157.43 425.16 156.79 424.87 157.04 425.08" />
                  </g>
                </g>

                {/* arrow control module-extensor */}
                <g className="mixBlendModeMultiply">
                  <g>
                    <path className="alternativeColor" d="M195.79,408.78c-.17-.13-.57-.06-.48.29l.68.23Z" />
                    <path
                      className="alternativeColor"
                      d="M194.65,411.13a1.28,1.28,0,0,0,1.51.53c-.65-.36-.39-.47-1.16-.87a.42.42,0,0,1,.44-.56c-.18-.12.12-.54-.3-.72a1.1,1.1,0,0,0,0,1.62C195,411.27,194.77,411.15,194.65,411.13Z"
                    />
                    <path className="alternativeColor" d="M215.79,433.06l-.23-.06A.41.41,0,0,0,215.79,433.06Z" />
                    <path
                      className="alternativeColor"
                      d="M236.75,428.27c-.15.07-.19.16-.17.22C236.7,428.39,236.8,428.31,236.75,428.27Z"
                    />
                    <path className="alternativeColor" d="M240.43,427.58l-.22,0C240.31,427.65,240.4,427.65,240.43,427.58Z" />
                    <path className="alternativeColor" d="M215.79,433.06l.59.17C216.41,433,216.07,433.09,215.79,433.06Z" />
                    <path className="alternativeColor" d="M196.67,415.56a.66.66,0,0,0-.21-.26c0,.09.08.17.11.26Z" />
                    <path className="alternativeColor" d="M206,432.49l-.18-.07-.23.2Z" />
                    <path
                      className="alternativeColor"
                      d="M199.29,428.55c.11.15.54-.21.75-.34a.53.53,0,0,1-.52,0A1,1,0,0,0,199.29,428.55Z"
                    />
                    <path className="alternativeColor" d="M194.76,417.54l-.12-.19S194.72,417.48,194.76,417.54Z" />
                    <path className="alternativeColor" d="M211.39,433.67a.48.48,0,0,0,.05.2A.29.29,0,0,0,211.39,433.67Z" />
                    <path className="alternativeColor" d="M378.06,325a.55.55,0,0,0,.06.08C378.12,325,378.1,325,378.06,325Z" />
                    <path className="alternativeColor" d="M386.14,321.58l-.06.1a1.64,1.64,0,0,0,.19.25Z" />
                    <path className="alternativeColor" d="M246.88,425.5h0C246.71,425.64,246.8,425.59,246.88,425.5Z" />
                    <path
                      className="alternativeColor"
                      d="M299.21,393.52c-.85,0,.56-1.17-.62-1C298.8,392.61,298.32,393.75,299.21,393.52Z"
                    />
                    <path className="alternativeColor" d="M196.62,415.75a2.68,2.68,0,0,1,.07.27A.59.59,0,0,0,196.62,415.75Z" />
                    <path className="alternativeColor" d="M298.59,392.49Z" />
                    <path
                      className="alternativeColor"
                      d="M260.5,418.15a.94.94,0,0,0-.26-.14C260.27,418.06,260.34,418.11,260.5,418.15Z"
                    />
                    <path className="alternativeColor" d="M249.94,422.77l.29-.06A.78.78,0,0,0,249.94,422.77Z" />
                    <path
                      className="alternativeColor"
                      d="M265.29,414.52c.15,0,.24,0,.38-.17l-.09,0C265.55,414.43,265.49,414.51,265.29,414.52Z"
                    />
                    <path className="alternativeColor" d="M270.61,411.37l-.15,0-.16.13Z" />
                    <path className="alternativeColor" d="M364,337.34a1.51,1.51,0,0,1,.54.2C364.25,337.3,364.85,336.6,364,337.34Z" />
                    <path
                      className="alternativeColor"
                      d="M196.36,415.62a.28.28,0,0,1,.26.13,1.33,1.33,0,0,1-.05-.19A.27.27,0,0,0,196.36,415.62Z"
                    />
                    <path className="alternativeColor" d="M263.28,410.56l.88-.42A5,5,0,0,0,263.28,410.56Z" />
                    <path className="alternativeColor" d="M329.82,365.14,330,365A.22.22,0,0,0,329.82,365.14Z" />
                    <path className="alternativeColor" d="M266.61,408.61a1.27,1.27,0,0,0,.66.05.35.35,0,0,0,0-.18Z" />
                    <path className="alternativeColor" d="M364.59,337.54h0Z" />
                    <path
                      className="alternativeColor"
                      d="M368.64,332.37c-.72.59.13.83.25,1.28-.71.88-.74-.08-1.27-.12-.4.6-.37,1.46-.78,1.77-.11-.07-.22,0-.23-.23-.18.92-1.64,1.43-1.82,2.54a.36.36,0,0,1-.2-.07,2.42,2.42,0,0,1,.75.69c-.31.28-.29.86-.72.59.2-.15.09-.31.09-.51l-.2.44c-.75-.27.3-.56,0-1-.51.72-.9,1.8-1.53,2.07-.54-.43,1-1.15,0-1.06l.94-.45c-1.28-.32.52-.33-.76-.76-1.15.71-.92,1.22-2.06,1.92,0,.49.43.37.45.85-1,1.73-2.24-.36-2.73,1.22,0,.58.46,1.33-.59,1.61l-.23-.8c-1,.76.14,1.31-1.23,1.78,0-.39.62-.84.41-.79-1.06.09-.2.73-.72,1.16l-.54-.44c-1,1-1.84,2.3-2.94,3.36-.06-.21,0-.54-.4-.48a15.84,15.84,0,0,1-4.91,3.38l-.17.9c-.14.09-.41,0-.34-.22-.7.28.2.31.08.71-.29.29-.63.08-.54-.22-.68,1.18-2.14,3.11-3.58,3.45l.09-.29c-1,.46-.17,1.67-1.26,1.85l.08-.2c-1.93,1.22-3.56,3.19-5.46,3.57.27.87-2,1.08-1.38,2.1-1.37.34-1.21-.05-2.88.76-.42.26-.12,1-.52,1.49l-.39-.47-.25,1-.79-.32L330,365c.2-.11.55-.07.63.09-.52.76-2,1-2.17.74l-1.33,1.68c-.11-.22.11-.5.23-.79-.49,1.17-.55-.4-1,.68.2,0,.17.34.23.45a3.89,3.89,0,0,0-2.13,1.36l-.13-.44c-1.29.86-2.46,2.14-3.85,3.18a.51.51,0,0,1,.59.82l-.56-.4c0,.52.57-.12.33.68-.56.33-.79-.33-.62-.72l-.49.65c-.16-.12-.07-.32-.18-.54,0,.51-1.48.29-1.43,1.13l-.15-.13c-1.39,1-1.88,1.69-3,2.56.31.46-.2.69-.27,1.31a15.4,15.4,0,0,0-3.1,1.58c-.54.75.08.54,0,1-.36-.37-1.34.4-1-.27a17.64,17.64,0,0,0-2.77,2.66c.29.05.53,0,.53.2-.23.27-.76.29-.86.06l0-.1c-1.27,1.88-4.85,1.67-5.61,3.52l.05-.1-1.11,1.47c-.71.39.17-.6-.5-.51-1.05,1.79-2.51,1.63-3.46,3-1.86-.56-3.45,2.54-5.35,2.65l.28.24c-.15.53-.54.12-.84.23.19.2.56,0,.45.31-2.7,2.38-6.38,3.71-9.61,5.43-1.17.65.37,1.95-1.5,2.16l0-.81c-1.84,2.12-4.64,3-6.53,4.91.06-.21,0-.38.18-.51-.73-.12-1.76,1.06-1.57,1.4-.37.18-.26-.25-.58-.29-.62.06-.87,1.26-1.38,1-.08,0,.06-.22.12-.3-.19.39-1.48.82-.89,1.12-1,.28-1.49,1.19-2.34,1.31-.12.81-1.61.61-1.3,1.45-.4-.82-1.87.24-2.19.93,0-.35-.61,0-.59-.43-.61.37-1.09.85-.75,1.19-1.68-.3-1.87,2.05-3.2,1.21a46.56,46.56,0,0,1-4.75,3.77c-.37-.83,1.81-1.09,1.29-1.88-1.41,1.19-2,2.36-3.67,3-.46.1.06-.47.13-.68-1.43,1.17-3.14,1.52-4.36,2.65,0-.07.08-.23.2-.37-.27.17-.72.21-.51.56l.23-.24c.72.32-.59,1.68-.5,2,0-1.3-1.56.42-1.43-1.29-.15.16-.31.44-.15.67-.31.06-.47-.05-.32-.46-.93.68-.38.9-1.32,1.32-.08-.18.08-.33.08-.59a2.21,2.21,0,0,1-1.48,1.35c0-.13-.16-.23.08-.34-1.32.68-1.92,2-3.56,2.27.11-1-.63-.05-1-.7l-.73.53.47.2c-.72.27-1.15,1-1.86,1l.42-.49-1.28.65.86,0c-.59.64.41.85-.62,1,.17-.14-.72.28-1.26,0h0a1.47,1.47,0,0,1-1.17.73c-.22-.17-.16-.82-.31-.93-.14.7-1.63.77-1.87,1.54a.74.74,0,0,0-.09-.63l-.14.57c-.39-.05-.47-.11-.51-.42-1,.23.62.8-.72.79.08-.07,0-.13.19-.26-1.27.18-2.26,1-3.47,1.08-.52-.64.94-.44.39-.95a22.66,22.66,0,0,0-2.36,1.11,7.79,7.79,0,0,1-2.42.75l.32,0c0,1.09-1.29-.25-2,.34.19-.11.17-.62.14-.5-1.12,0-2.18.63-3.83,1l.18-.28c-.66-.21-1.7,0-2.39-.16-.21.27-.61.22-.37.62a2.65,2.65,0,0,0-1.55-.57,5.89,5.89,0,0,0-1.51.05,2.8,2.8,0,0,1-2.77-.64c.21,0,.57-.12.4-.16a9,9,0,0,1-1.57-.18c0,.48.1.33.31.79a1.38,1.38,0,0,1-1.17.09c.8,0,.24-.7.06-1.05,0,.15-.16.26-.19.4-.24-.52-.36-.32-.53-.1s-.43.48-.82-.07l.16-.19c-.43-.09-.95,0-1.33-.3.1-.55.53,0,.77-.36a2.65,2.65,0,0,0-1.07-.07c-.37,0-.68-.14-.76-.54.31.05.62.31.93.33a1.52,1.52,0,0,0-.6-1.16l0,0-.65-.85.1.29a1.08,1.08,0,0,1-1.41-.3,2.17,2.17,0,0,0-1.33-.84c1.39.25.5-.19,1-.5-.07-.3-.11-.77.08-.77-.67-.12-.13-.88-1.12-1.05.14-.13-.28-.45.21-.61-.41-.49-.24.31-.46.38-.52-.28-.61-.93-.74-1.57a3.1,3.1,0,0,0-.9-1.89,5.36,5.36,0,0,0-1.12-1.12,3.69,3.69,0,0,1-.94-1.18c.21-.47.76.17.76.17a2.19,2.19,0,0,0-.37-1.75c.19.1.31-.06.48-.28-.12-.48-.74-.22-.54-.92a2.66,2.66,0,0,1,.83.38c-.24-.55-.67-1.08-.92-1.67.32-.2.56.31.8.49-.22-.65-.54-1.71-1.06-1.89-.05.15-.12.31-.16.46-.05-.25.45-.16.57,0,.49.54-.09.86-.28.91l-.17-.42c-1.09.57.39,1.75.43,2.62l-.87-.24a10.47,10.47,0,0,0,.84.78c-.17.23-.6.45-.82,0-.26.71.42.5.09,1.14-.06.08-.1.06-.15,0l.38.57c-.2-.08-.55.24-.52-.18a1.77,1.77,0,0,0,.37,1.38c.26.32.46.55.23.86l-.08-.08c.79,1.43.64,0,1.69.83-.38.42-.78.87-1.13,1.31l.63-.09c0,.15.16.47-.09.51.65.38.19-.2.71,0a2.27,2.27,0,0,0,.44,1.35c.2.42.44.73.06,1.08.56,0-.12-.82.63-.29-.74.77.7.7.72,1.57-.55.15-.74-.61-.69.3.48-.08.68.21.84.58s.28.85.57,1c.27-.25.54,0,.89.27a8.25,8.25,0,0,0,1.32.9c-.09.06.21.5.71.89s1.14.86,1.53,1.22l-.08.09c.47-.52,1.36-.09,2.1,0a.79.79,0,0,1-.81.56l.67.24a1.17,1.17,0,0,1,.93-.13l-.32.47c.94.21,2-.17,3.08.4.13-.5-.66-1.5.57-1.71,0,.28,0,.75-.35.83.11,0,.4-.19.59,0l-.55.41c.5.26.33-.35.74-.27-.06.4.28.32.18.62-.11,0-.35-.2-.53-.06a2.07,2.07,0,0,1,1.2.74c0-.23,0-.53.4-.55.91,0,.28.5.81.72.24-.27.82,0,.84-.57.27,0,.32.29.42.45a5.66,5.66,0,0,1,1.22-.21c.42-.09.71-.22.44-.52l-.12,0s0,0,.07,0h0a4.41,4.41,0,0,1,2.33-.25,6.89,6.89,0,0,0,2.32-.15l0,.19a7.26,7.26,0,0,0,2.49-1c.26,0,.69.23.63.48a2.31,2.31,0,0,1,1.7-.42c-.59.51.31.26-.63.41.91,0,1.18.21,2-.55-.19.57.82.44,1.19.19l-.7-.19a4.8,4.8,0,0,1,1.28-.32l0,.7c2,.24,2.76-2.27,4.49-1.43.31-.6-1,0-.8-.64.81-.19,1.95.42,2.2.33,1.22,0,.69-1.26,1.9-1.44-.23-.17-.58-.71.17-1.24.8-.22,1.31.55.88.92-.17.09-.29.06-.31,0-.22.18-.52.41-.12.52l0-.26c.47.08,1.54-.37,1.43.09.51-.44.11-.46-.37-.4,1.12-.08,1.57-.59,2.67-.82-.21-.05-.46-.24-.3-.31,1.6-.37.48-.69,1.44-1.22.72.09.14.88,1,.17.72,0,.39.52.22.8.75-.81,1.85-.48,2.41-.65l-.41.4a2.23,2.23,0,0,1,.73-.45l-.48-.31c.32-.05.56-.16.64,0,.16-.42-.55-.62-.15-1.27.48.05,1-.76,1.43-.25-1.28.35.4.51-.56,1.07a1.27,1.27,0,0,1,.72-.32c.07,0,0,.13-.05.2,1.38,0,.23-.87,1.39-1.42,0,.39.57.47.72.31-.47.22-.48-.43-.17-.88.87-.12.72-.58,1.12-.74l-.5.1c0-.39.39-.53.85-.89.17.23-.38.4-.14.42.29-.84,1.59,0,2.19-.84.48,0,.34.58.74.55.68-.87,1.18-.06,1.95-.88-.49-.29-.49-.16,0-.91l-1.39,1.09.67-1.13c-.46.24-.84.77-1.15.85.29-.59.29-.46-.11-.7,1,.31,1.06-1,2-1l.52,1.06c1.35-.11,1.66-1.58,3.22-2.08l-.55.07c0-.52.84-.53,1.2-.95.15.37.51.34.82.45-.16-.24,1-.55.79-1.31l.87.1c1.24-.45.74-1.71,1.89-2.2-.11.56.52.52-.06,1.2.37-.2.73-.33.6-.57.34.1.73-1,1.25-.91.07-.23-.09-.62.33-.83a.25.25,0,0,1,.09.17c-.09-.17.5-.6-.07-.77,1.73.42,3-1.88,4.53-1.56.71-.58,1.58-1.25,2.26-1.71,0,.13.11.17-.05.22,1.16-.28,0-1.33,1.31-1.66.9.19-.4.65.08.64.84,1,1.23-1,2.37-.79l-.14.18c.8,0,1.12-1.27,2.08-1.78a.28.28,0,0,0,.1.17,7.11,7.11,0,0,1,2.12-2.62c0,.6-.25.48.19.81.36-.31-.56-.62.15-1.25.4.07,1.1-.09,1.48.32l-.73.51c.77.36.95-.64,1.4-.79l.12.29c1.08-.83.66-1.49,1.91-2.24l-.26-.12c.24-1.08.8,0,1.14-.91l.64.53a16.21,16.21,0,0,1,1.8-2.31,8.38,8.38,0,0,1-1.24,2.32c.44-.29,1.44-1,1.44-1.51-.13.18-.24.49-.48.5a3.38,3.38,0,0,1,1.58-2.15c.7,1.38,2.44-1.19,3.73-.63,1.19-1.5,3.14-1.85,4.83-3.15-1.3-.55.5-.39-.31-1.31.36-.35.53-.44.61-.4l1.65-.27c.5.09-.23.5,0,.69.94-.54.67.17,1.44,0-.37-.28,0-.73.55-1l-1,0c.86-1.41,1.66.08,2.54-1.34l-.17.6c.51-.64,2.37-1.67,2.42-2.93.19,0,.54.2.31.47,1.61-1,2.78-3.28,4.31-3.66l.06.33c.24-.28.17-.82.7-.83.05.11.06.32.2.24s.44-1,.92-1.1l-.12.5c1.71-.76,1.78-2.32,2.89-3.4.52.71,1.85.08,2.51-.23l.06.11c1.78-1.18,2.46-2.76,3.83-4.22,1.56,0,3.55-2.19,5.44-2.95-.33.05-.37-.58-.15-.86.47-.14.64-1.27,1.07-.58l-.14.09c.76.41,1.39-.33,2-.77l-.55-.91c2.48,0,3.67-3.56,5.35-3.12.21-.5.67-.85.87-1.35l.33.47a15.1,15.1,0,0,0,2.84-2.13V365c.74-.53-.11-2,.52-2.53l.72.5c1.23-1,2.95-1.4,3.68-3a.42.42,0,0,1,0,.52c.59-.45,2.6-1.35,1.66-2.09.49.58,1.32-1,1.77-1.75l.25.52c.11-1,0-1.18.67-2,.23-.09.44.22.1.3.8-.27.15-.8,1.08-1.17l-.05.5c.66-.47.49-.58.58-1.19.26-.49,1.29-.86,1.7-.55a.92.92,0,0,1,.44-1.1c.17.11.11.31.08.41,1.29-.57,1.16-1.78,2.23-2a.45.45,0,0,0,.33.16,12.36,12.36,0,0,1-1.5,1.12c.32.4,1.06-.09,1,.9.3-.74.69-2.16,1.51-2.51a.48.48,0,0,1,.2.07l0,.1a.76.76,0,0,0,.36-.41,2.41,2.41,0,0,0,.64-.33c.35.27.93-.46,1.28-.72-.39-.41.11-.7-.6-.72.08,0,0,.1-.23.3a.82.82,0,0,0-.11.17v-.06l-.82.72c.09-.44.21-.86.78-.92-.05-.42-.1-.87-.1-1.09,1,.23,2.11-.18,2.54.09.83-1.09,2.29-2.16,2.25-3.51.21-.35.53-.05.75,0-.1.22-.31.38-.31.57.41-.69,1.66-1.52,1.32-2.2.95-.36,0,.86,1-.07v.29c2.73-.76,2-4.14,5.15-4.83-.21.06-.31.09-.42,0,2.92-1.6,4.71-4.82,7.83-6.12.84-.44.6-.86.79-1.49l.55.32.26-1.15c.69-1.27,2.74-.41,3.4-2.27l-.43-.16c.51-.35,1.3-1.46,1.54-1,0-.1-.13-.46.19-.46l.22.23.78-1.41c1-.6.69,1.07,2,0,.4-.52.75-1.9.43-1.89-.2.16-.62.29-.85.06l.33-.51c-.55-.76-.85-1.77-2.34-1.31l-.36,1.08-.54-.13.6-.57c-.63,0-.61.48-.69.89a.78.78,0,0,0-.64-.1l-.14,1.31c-.33-.19-.15-.83-.77-.55-.07.61.87.33.48,1-.64,0-.76-.36-.94.28a.37.37,0,0,1-.13-.54c-.18.54-.91.95-.77,1.49-.72-.07-1.17,1.2-1.72.51a2.54,2.54,0,0,1-.52,1.42c-.06-1.35-1.33,1.07-1.9.07.15,1.11-1.4,1.77-1.89,2.88,0-.1,0-.29.09-.32-.51.34-.83.24-1.25.36.45.64-.16,1.4-.23,2.11-1.07-.09-.26-1-.91-1.4.45.46-.58,1.33,0,1.57-.74,0-.52.15-1.17-.15.56.81-.3.47-.27,1.24-.95.17-.76-.56-1.26.26C368.24,333.16,368.64,332.37,368.64,332.37ZM353,347.6h0l.33-.3Zm-1.41,1.17a6.89,6.89,0,0,0,.63-.49c.17.11.24.31.1.42C352.35,348.54,352,348.72,351.63,348.77Zm5.47.56c-.18.24-.32.22-.43.15a4.48,4.48,0,0,0,.35-.37V349A1.14,1.14,0,0,1,357.1,349.33Z"
                    />
                    <path className="alternativeColor" d="M357,348.42a.46.46,0,0,1,.07-.1h-.22l0,.2Z" />
                    <path className="alternativeColor" d="M215.52,433h0a.22.22,0,0,1-.09-.07S215.5,433,215.52,433Z" />
                    <polygon className="alternativeColor" points="331.25 363.67 331.34 363.79 331.39 363.59 331.25 363.67" />
                    <path className="alternativeColor" d="M206,429.74a.27.27,0,0,0-.07-.17A.5.5,0,0,0,206,429.74Z" />
                    <path className="alternativeColor" d="M202.54,427.68l-.32-.5A2.28,2.28,0,0,0,202.54,427.68Z" />
                    <path className="alternativeColor" d="M200.52,425.39a1,1,0,0,0-.23.12h0Z" />
                    <path
                      className="alternativeColor"
                      d="M248.08,419.49a.39.39,0,0,0,.1-.08C248.4,419.18,248.24,419.31,248.08,419.49Z"
                    />
                    <path
                      className="alternativeColor"
                      d="M234.22,427a3.07,3.07,0,0,1,.38-.42C234.32,426.58,234.11,426.65,234.22,427Z"
                    />
                    <path className="alternativeColor" d="M263.19,410.6h0l.09-.05Z" />
                    <path className="alternativeColor" d="M235.28,426.28a1,1,0,0,0-.68.25A1.37,1.37,0,0,0,235.28,426.28Z" />
                    <path className="alternativeColor" d="M196.38,412.73v-.16a.16.16,0,0,1-.1,0Z" />
                    <path className="alternativeColor" d="M196.29,412.56c0-.05-.06-.11-.08-.16S196.23,412.54,196.29,412.56Z" />
                    <path className="alternativeColor" d="M196.06,412l.15.36C196.21,412.27,196.22,412.11,196.06,412Z" />
                    <path className="alternativeColor" d="M196.75,416.94H197A.45.45,0,0,0,196.75,416.94Z" />
                    <path
                      className="alternativeColor"
                      d="M197.08,418.18c0-.31.26-.85,0-1.23H197C197.3,417.07,196.69,418,197.08,418.18Z"
                    />
                    <path
                      className="alternativeColor"
                      d="M196.78,424.26l-.38-1.13c-.11.28-.25.66-.54.19C196,425,196.16,422.83,196.78,424.26Z"
                    />
                    <path
                      className="alternativeColor"
                      d="M198.67,427.49c-.53-.42-.23.21-.35.26C198.77,427.94,198.87,428,198.67,427.49Z"
                    />
                    <path className="alternativeColor" d="M223.56,432.33l.05.52C224.06,432.68,223.57,432.65,223.56,432.33Z" />
                    <path className="alternativeColor" d="M227.6,428.6l-.51-.19-.08.51C227.21,428.81,227.41,428.72,227.6,428.6Z" />
                    <polygon className="alternativeColor" points="231.41 431.23 231.23 431.36 231.94 430.95 231.41 431.23" />
                    <path className="alternativeColor" d="M269.93,412.37l-.45-.47C269.27,412.16,269.57,412.8,269.93,412.37Z" />
                    <path className="alternativeColor" d="M285.17,402a.7.7,0,0,0,1-.39C285.78,401.81,285.3,401.83,285.17,402Z" />
                    <polygon className="alternativeColor" points="330.51 370.65 330.34 371.04 330.79 370.48 330.51 370.65" />
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
  );
};

export default AnimatedGrowcastIndustryWithControlAndExpander;

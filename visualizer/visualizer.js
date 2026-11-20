/* Portada (mode 1) with the EAM palette.
   Drawing routines are the artist's, kept so the picture matches.
   Public page: playlist audio, idle breath, play and fullscreen only. */
(function () {
  "use strict";

  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d", { alpha: false });
  const playBtn = document.getElementById("play");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const muteBtn = document.getElementById("mute");
  const volumeInput = document.getElementById("volume");
  const fsBtn = document.getElementById("full");
  const controls = document.getElementById("controls");
  const audioEl = document.getElementById("track");

  const PALETTES = {
    eam: {
      carbon: "#0B0A09", carbonHi: "#1A1714", smoke: "#8A8174",
      cream: "#E8DCC0", amber: "#E0A24A", core: "#FFD890",
      wine: "#6B1A24", wineDeep: "#3A0D14"
    }
  };
  let pal = PALETTES.eam;

  const BANNER = {
    w: 1920, h: 1080,
    flameX: 275 / 2560, flameY: 600 / 1440,
    flameTipY: 0.385, flameBaseY: 0.45,
    eyeX: 1858 / 2560, eyeY: 193 / 1440,
    voidX: 1200 / 2560, voidY: 560 / 1440,
    ringR: 260 / 2560,
    vertFocusX: 0.22, vertFocusY: 0.42,
    vertVoidX: 0.30, vertVoidY: 0.36
  };

  const SPEC_MIN_HZ = 30;
  const SPEC_MAX_HZ = 12000;
  const SPEC_BANDS = 96;
  const specBands = new Float32Array(SPEC_BANDS);
  const specFloor = new Float32Array(SPEC_BANDS);
  const specPeak = new Float32Array(SPEC_BANDS);
  const specTmp = new Float32Array(SPEC_BANDS);
  for (let i = 0; i < SPEC_BANDS; i++) specPeak[i] = 0.15;

  const FILM_PATH = [[0.04, 0.67], [0.03911111111111111, 0.6755555555555556], [0.03822222222222223, 0.6811111111111111], [0.037333333333333336, 0.6866666666666668], [0.036444444444444446, 0.6922222222222223], [0.035555555555555556, 0.6977777777777778], [0.034666666666666665, 0.7033333333333334], [0.03377777777777778, 0.7088888888888889], [0.03288888888888889, 0.7144444444444444], [0.032, 0.72], [0.03111111111111111, 0.7255555555555555], [0.030222222222222223, 0.731111111111111], [0.029333333333333333, 0.7366666666666666], [0.028444444444444446, 0.7422222222222222], [0.027555555555555555, 0.7477777777777778], [0.026666666666666665, 0.7533333333333333], [0.025777777777777778, 0.7588888888888888], [0.024888888888888887, 0.7644444444444444], [0.024, 0.77], [0.024888888888888887, 0.7755555555555556], [0.025777777777777778, 0.7811111111111111], [0.026666666666666665, 0.7866666666666666], [0.027555555555555555, 0.7922222222222222], [0.028444444444444446, 0.7977777777777777], [0.029333333333333333, 0.8033333333333333], [0.030222222222222223, 0.8088888888888889], [0.03111111111111111, 0.8144444444444444], [0.032, 0.82], [0.03288888888888889, 0.8255555555555555], [0.03377777777777778, 0.8311111111111111], [0.034666666666666665, 0.8366666666666667], [0.035555555555555556, 0.8422222222222222], [0.036444444444444446, 0.8477777777777777], [0.037333333333333336, 0.8533333333333333], [0.03822222222222223, 0.8588888888888888], [0.03911111111111111, 0.8644444444444445], [0.04, 0.87], [0.04294117647058824, 0.8720588235294118], [0.04588235294117647, 0.8741176470588236], [0.04882352941176471, 0.8761764705882353], [0.051764705882352935, 0.8782352941176471], [0.05470588235294118, 0.8802941176470588], [0.057647058823529405, 0.8823529411764706], [0.060588235294117644, 0.8844117647058823], [0.06352941176470588, 0.8864705882352941], [0.06647058823529411, 0.8885294117647059], [0.06941176470588235, 0.8905882352941177], [0.07235294117647059, 0.8926470588235295], [0.07529411764705882, 0.8947058823529412], [0.07823529411764704, 0.8967647058823529], [0.08117647058823528, 0.8988235294117647], [0.08411764705882352, 0.9008823529411765], [0.08705882352941176, 0.9029411764705882], [0.09, 0.905], [0.09305555555555554, 0.9030555555555556], [0.0961111111111111, 0.9011111111111112], [0.09916666666666665, 0.8991666666666667], [0.10222222222222221, 0.8972222222222223], [0.10527777777777776, 0.8952777777777778], [0.10833333333333332, 0.8933333333333334], [0.1113888888888889, 0.8913888888888888], [0.11444444444444443, 0.8894444444444444], [0.11749999999999998, 0.8875], [0.12055555555555555, 0.8855555555555555], [0.12361111111111112, 0.8836111111111111], [0.12666666666666665, 0.8816666666666666], [0.1297222222222222, 0.8797222222222222], [0.13277777777777777, 0.8777777777777778], [0.13583333333333333, 0.8758333333333334], [0.1388888888888889, 0.8738888888888888], [0.14194444444444443, 0.8719444444444444], [0.168, 0.7], [0.16893333333333335, 0.6946666666666667], [0.16986666666666667, 0.6893333333333332], [0.1708, 0.6839999999999999], [0.17173333333333335, 0.6786666666666665], [0.1726666666666667, 0.6733333333333332], [0.1736, 0.6679999999999999], [0.17453333333333335, 0.6626666666666666], [0.17546666666666666, 0.6573333333333333], [0.1764, 0.6519999999999999], [0.17733333333333332, 0.6466666666666666], [0.17826666666666666, 0.6413333333333333], [0.17919999999999997, 0.6359999999999999], [0.1801333333333333, 0.6306666666666666], [0.18106666666666665, 0.6253333333333333], [0.182, 0.62], [0.1829285714285714, 0.6146428571428572], [0.18385714285714286, 0.6092857142857142], [0.18478571428571428, 0.6039285714285714], [0.1857142857142857, 0.5985714285714286], [0.18664285714285714, 0.5932142857142857], [0.18757142857142856, 0.5878571428571429], [0.1885, 0.5825], [0.18942857142857145, 0.5771428571428572], [0.19035714285714286, 0.5717857142857143], [0.1912857142857143, 0.5664285714285714], [0.19221428571428573, 0.5610714285714286], [0.19314285714285714, 0.5557142857142858], [0.1940714285714286, 0.5503571428571429], [0.13, 0.8899999999999999], [0.13304347826086957, 0.8880434782608695], [0.13608695652173913, 0.8860869565217391], [0.1391304347826087, 0.8841304347826087], [0.14217391304347826, 0.8821739130434781], [0.14521739130434783, 0.8802173913043478], [0.1482608695652174, 0.8782608695652173], [0.15130434782608698, 0.8763043478260869], [0.15434782608695652, 0.8743478260869564], [0.15739130434782608, 0.8723913043478261], [0.16043478260869565, 0.8704347826086956], [0.16347826086956524, 0.8684782608695651], [0.16652173913043478, 0.8665217391304348], [0.16956521739130434, 0.8645652173913043], [0.1726086956521739, 0.8626086956521738], [0.1756521739130435, 0.8606521739130435], [0.17869565217391306, 0.858695652173913], [0.1817391304347826, 0.8567391304347826], [0.18478260869565216, 0.854782608695652], [0.18782608695652175, 0.8528260869565217], [0.1908695652173913, 0.8508695652173912], [0.19391304347826085, 0.8489130434782608], [0.19695652173913042, 0.8469565217391305], [0.2, 0.845], [0.2032, 0.8442], [0.2064, 0.8433999999999999], [0.2096, 0.8426], [0.21280000000000002, 0.8418], [0.21600000000000003, 0.841], [0.2192, 0.8402], [0.22240000000000001, 0.8393999999999999], [0.22560000000000002, 0.8386], [0.22880000000000003, 0.8378], [0.23200000000000004, 0.837], [0.23520000000000002, 0.8361999999999999], [0.23840000000000003, 0.8353999999999999], [0.24160000000000004, 0.8346], [0.24480000000000005, 0.8338], [0.248, 0.833], [0.25120000000000003, 0.8321999999999999], [0.25440000000000007, 0.8313999999999999], [0.2576, 0.8306], [0.26080000000000003, 0.8298], [0.264, 0.829], [0.2672, 0.8281999999999999], [0.27040000000000003, 0.8273999999999999], [0.2736, 0.8266000000000001], [0.27680000000000005, 0.8258], [0.28, 0.825], [0.2832, 0.8241999999999999], [0.28640000000000004, 0.8233999999999999], [0.2896, 0.8226000000000001], [0.2928, 0.8218000000000001], [0.296, 0.821], [0.2992, 0.8201999999999999], [0.3024, 0.8193999999999999], [0.3056, 0.8186000000000001], [0.3088, 0.8178000000000001], [0.312, 0.8170000000000001], [0.31520000000000004, 0.8162], [0.3184, 0.8153999999999999], [0.3216, 0.8146000000000001], [0.3248, 0.8138000000000001], [0.32799999999999996, 0.8130000000000001], [0.3312, 0.8122], [0.3344, 0.8114], [0.3376, 0.8106000000000001], [0.3408, 0.8098000000000001], [0.344, 0.809], [0.34719999999999995, 0.8082], [0.35039999999999993, 0.8074], [0.35359999999999997, 0.8066000000000001], [0.35679999999999995, 0.8058000000000001], [0.36, 0.805], [0.36319999999999997, 0.8042], [0.36639999999999995, 0.8034], [0.3696, 0.8026000000000001], [0.37279999999999996, 0.8018000000000001], [0.376, 0.801], [0.3792, 0.8002], [0.38239999999999996, 0.7994], [0.3856, 0.7986000000000001], [0.3888, 0.7978000000000001], [0.392, 0.797], [0.3952, 0.7962], [0.3984, 0.7954], [0.4016, 0.7946000000000001], [0.4048, 0.7938000000000001], [0.40800000000000003, 0.793], [0.4112, 0.7922], [0.4144, 0.7914], [0.4176, 0.7906000000000001], [0.4208, 0.7898000000000001], [0.42400000000000004, 0.789], [0.4272, 0.7882], [0.4304, 0.7874], [0.43360000000000004, 0.7866000000000001], [0.4368, 0.7858], [0.44000000000000006, 0.785], [0.44318181818181823, 0.7840909090909092], [0.4463636363636364, 0.7831818181818182], [0.4495454545454546, 0.7822727272727273], [0.45272727272727276, 0.7813636363636364], [0.45590909090909093, 0.7804545454545455], [0.4590909090909091, 0.7795454545454545], [0.4622727272727273, 0.7786363636363637], [0.46545454545454545, 0.7777272727272728], [0.46863636363636363, 0.7768181818181819], [0.4718181818181818, 0.7759090909090909], [0.475, 0.775], [0.47818181818181815, 0.7740909090909092], [0.4813636363636363, 0.7731818181818181], [0.48454545454545456, 0.7722727272727272], [0.4877272727272727, 0.7713636363636364], [0.4909090909090909, 0.7704545454545455], [0.494090909090909, 0.7695454545454544], [0.49727272727272726, 0.7686363636363636], [0.5004545454545454, 0.7677272727272727], [0.5036363636363637, 0.7668181818181818], [0.5068181818181818, 0.7659090909090908], [0.52, 0.7900000000000001], [0.5218421052631579, 0.7852631578947369], [0.5236842105263159, 0.7805263157894738], [0.5255263157894737, 0.7757894736842106], [0.5273684210526316, 0.7710526315789475], [0.5292105263157895, 0.7663157894736843], [0.5310526315789474, 0.761578947368421], [0.5328947368421053, 0.756842105263158], [0.5347368421052632, 0.7521052631578947], [0.5365789473684212, 0.7473684210526317], [0.5384210526315789, 0.7426315789473684], [0.5402631578947369, 0.7378947368421052], [0.5421052631578948, 0.7331578947368421], [0.5439473684210527, 0.7284210526315789], [0.5457894736842106, 0.7236842105263158], [0.5476315789473685, 0.7189473684210526], [0.5494736842105263, 0.7142105263157894], [0.5513157894736842, 0.7094736842105263], [0.5531578947368422, 0.7047368421052631], [0.555, 0.7], [0.5557727272727273, 0.6945454545454545], [0.5565454545454547, 0.689090909090909], [0.5573181818181819, 0.6836363636363636], [0.5580909090909091, 0.6781818181818181], [0.5588636363636363, 0.6727272727272726], [0.5596363636363637, 0.6672727272727272], [0.560409090909091, 0.6618181818181817], [0.5611818181818182, 0.6563636363636363], [0.5619545454545455, 0.6509090909090909], [0.5627272727272727, 0.6454545454545454], [0.5635, 0.6399999999999999], [0.5642727272727273, 0.6345454545454545], [0.5650454545454545, 0.629090909090909], [0.5658181818181818, 0.6236363636363637], [0.5665909090909091, 0.6181818181818182], [0.5673636363636364, 0.6127272727272727], [0.5681363636363637, 0.6072727272727272], [0.5689090909090909, 0.6018181818181817], [0.5696818181818182, 0.5963636363636363], [0.5704545454545454, 0.5909090909090909], [0.5712272727272727, 0.5854545454545454], [0.572, 0.58], [0.5728125, 0.574375], [0.573625, 0.56875], [0.5744374999999999, 0.563125], [0.5752499999999999, 0.5575], [0.5760625, 0.551875], [0.576875, 0.5462499999999999], [0.5776874999999999, 0.540625], [0.5785, 0.535], [0.5793125, 0.5293749999999999], [0.580125, 0.52375], [0.5809374999999999, 0.5181250000000001], [0.58175, 0.5125], [0.5825625, 0.506875], [0.583375, 0.50125], [0.5841875, 0.49562500000000004], [0.585, 0.49], [0.5875, 0.4865625], [0.59, 0.483125], [0.5925, 0.4796875], [0.595, 0.47624999999999995], [0.5974999999999999, 0.4728125], [0.6, 0.469375], [0.6024999999999999, 0.4659375], [0.605, 0.4625], [0.6075, 0.4590625], [0.61, 0.455625], [0.6125, 0.45218749999999996], [0.615, 0.44875000000000004], [0.6174999999999999, 0.4453125], [0.62, 0.44187499999999996], [0.6224999999999999, 0.43843750000000004], [0.625, 0.435], [0.628095238095238, 0.434047619047619], [0.6311904761904762, 0.4330952380952381], [0.6342857142857142, 0.4321428571428571], [0.6373809523809524, 0.4311904761904762], [0.6404761904761904, 0.4302380952380952], [0.6435714285714286, 0.42928571428571427], [0.6466666666666667, 0.4283333333333333], [0.6497619047619048, 0.4273809523809524], [0.6528571428571428, 0.4264285714285714], [0.655952380952381, 0.4254761904761905], [0.659047619047619, 0.4245238095238095], [0.6621428571428571, 0.4235714285714286], [0.6652380952380952, 0.4226190476190476], [0.6683333333333332, 0.4216666666666667], [0.6714285714285714, 0.4207142857142857], [0.6745238095238095, 0.4197619047619048], [0.6776190476190476, 0.4188095238095238], [0.6807142857142857, 0.4178571428571429], [0.6838095238095238, 0.4169047619047619], [0.6869047619047619, 0.415952380952381], [0.69, 0.41500000000000004], [0.693125, 0.4140625], [0.6962499999999999, 0.41312499999999996], [0.699375, 0.41218750000000004], [0.7024999999999999, 0.41125], [0.705625, 0.4103125], [0.70875, 0.409375], [0.7118749999999999, 0.4084375], [0.7150000000000001, 0.4075], [0.718125, 0.40656250000000005], [0.7212500000000001, 0.405625], [0.724375, 0.4046875], [0.7275, 0.40375], [0.7306250000000001, 0.40281249999999996], [0.73375, 0.40187500000000004], [0.7368750000000001, 0.4009375], [0.905, 0.325], [0.9075000000000001, 0.32875], [0.9100000000000001, 0.3325], [0.9125, 0.33625], [0.915, 0.34], [0.9175000000000001, 0.34375], [0.9199999999999999, 0.3475], [0.9225, 0.35125], [0.925, 0.355], [0.9275, 0.35875], [0.93, 0.3625], [0.9324999999999999, 0.36624999999999996], [0.9349999999999999, 0.37], [0.9375, 0.37375], [0.9399999999999998, 0.3775], [0.9424999999999999, 0.38125], [0.945, 0.385], [0.946, 0.3905882352941176], [0.9469999999999998, 0.3961764705882353], [0.9479999999999998, 0.4017647058823529], [0.9489999999999998, 0.40735294117647053], [0.95, 0.41294117647058826], [0.951, 0.41852941176470587], [0.952, 0.4241176470588235], [0.953, 0.42970588235294116], [0.954, 0.4352941176470588], [0.9549999999999998, 0.4408823529411764], [0.9559999999999998, 0.44647058823529406], [0.9569999999999999, 0.45205882352941174], [0.958, 0.4576470588235294], [0.959, 0.463235294117647], [0.96, 0.46882352941176464], [0.961, 0.4744117647058823], [0.962, 0.4799999999999999], [0.9611764705882353, 0.48558823529411754], [0.9603529411764706, 0.49117647058823527], [0.9595294117647057, 0.4967647058823529], [0.9587058823529411, 0.5023529411764704], [0.9578823529411764, 0.5079411764705882], [0.9570588235294117, 0.5135294117647058], [0.9562352941176471, 0.5191176470588235], [0.9554117647058824, 0.5247058823529411], [0.9545882352941175, 0.5302941176470587], [0.9537647058823528, 0.5358823529411764], [0.9529411764705882, 0.541470588235294], [0.9521176470588235, 0.5470588235294117], [0.9512941176470588, 0.5526470588235294], [0.9504705882352942, 0.5582352941176469], [0.9496470588235294, 0.5638235294117646], [0.9488235294117647, 0.5694117647058823]];

  const bannerImg = new Image();
  const smokeImg = new Image();
  const filmImg = new Image();
  const grainImg = new Image();
  let assetsReady = 0;
  function onAsset() { assetsReady++; }
  bannerImg.onload = onAsset;
  smokeImg.onload = onAsset;
  filmImg.onload = onAsset;
  grainImg.onload = onAsset;
  bannerImg.src = "assets/banner.webp";
  smokeImg.src = "assets/smoke.webp";
  filmImg.src = "assets/film.webp";
  grainImg.src = "assets/grain.webp";

  let W = 1920, H = 1080, dpr = 1;
  let quality = 1;
  let smokeStrip = 5;
  let slowStreak = 0;
  let audioCtx = null, analyser = null, sourceNode = null, gainNode = null;
  let freq = null, timeDom = null;
  let running = false, raf = 0, lastT = 0;
  const mode = 0;
  const sensitivity = 1;
  let bannerRect = { x: 0, y: 0, w: 0, h: 0, scale: 1 };
  let reducedMotion = false;
  try {
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = function () { reducedMotion = mq.matches; };
    if (mq.addEventListener) mq.addEventListener("change", onMotion);
    else if (mq.addListener) mq.addListener(onMotion);
  } catch (e) {}

  const MAX_PARTICLES = 80;
  const particles = [];

  const bands = {
    bass: 0, mid: 0, high: 0, energy: 0, rms: 0,
    sBass: 0, sMid: 0, sHigh: 0, sEnergy: 0, sRms: 0
  };
  let prevBassRaw = 0;
  const FLUX_CAP = 128;
  const fluxWin = new Array(FLUX_CAP);
  for (let i = 0; i < FLUX_CAP; i++) fluxWin[i] = { t: 0, v: 0 };
  let fluxHead = 0, fluxCount = 0;
  let avgEnergy = 0.02;
  let lastBeat = 0;
  let lastWineFlash = 0;
  let beatFlash = 0;
  let wineVignette = 0;
  let eyeGlow = 0;
  let wing = 0;
  let flameFlicker = 0;
  let pulse = 0;
  let vignettePulse = 0;
  let bpm = 66;
  const beatIntervals = [];
  let t0 = performance.now();
  let smokeScroll = 0;
  let filmSweep = 0;
  let filmFlicker = 0;
  let slitShake = 0;
  let hiddenPause = false;
  let drawnFrames = 0;
  let workSum = 0;
  let workN = 0;
  const recLayout = null;

  const playlist = [];
  let trackIndex = 0;
  let assignedSrc = "";
  let volume = 1;
  let muted = false;
  let lastNonZero = 1;
  let hideTimer = 0;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function envFollow(cur, target, atk, rel) {
    const k = target > cur ? atk : rel;
    return cur + (target - cur) * k;
  }
  function envFollowDt(cur, target, atk, rel, dt) {
    const k = target > cur ? atk : rel;
    const step = 1 - Math.pow(1 - k, (dt || (1 / 60)) * 60);
    return cur + (target - cur) * step;
  }
  const hexCache = Object.create(null);
  function hexRgb(hex) {
    let cached = hexCache[hex];
    if (!cached) {
      const h = hex.replace("#", "");
      cached = hexCache[hex] = [
        parseInt(h.slice(0, 2), 16),
        parseInt(h.slice(2, 4), 16),
        parseInt(h.slice(4, 6), 16)
      ];
    }
    return cached;
  }
  function rgba(hex, a) {
    const c = hexRgb(hex);
    return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
  }

    function fillLogSpectrum(dt) {
      if (!analyser || !freq || !audioCtx) {
        specBands.fill(0);
        return;
      }
      const nBins = freq.length;
      const nyquist = audioCtx.sampleRate / 2;
      const hzPerBin = nyquist / nBins;
      const minBin = Math.max(1, Math.ceil(SPEC_MIN_HZ / hzPerBin)); // skip DC + sub-30 Hz
      const maxHz = Math.min(SPEC_MAX_HZ, nyquist * 0.98);
      const logMin = Math.log(SPEC_MIN_HZ);
      const logRange = Math.log(maxHz) - logMin;
      const n = SPEC_BANDS;
      for (let i = 0; i < n; i++) {
        const f0 = Math.exp(logMin + logRange * (i / n));
        const f1 = Math.exp(logMin + logRange * ((i + 1) / n));
        const b0 = Math.max(minBin, Math.floor(f0 / hzPerBin));
        const b1 = Math.min(nBins, Math.ceil(f1 / hzPerBin));
        let s = 0, c = 0;
        for (let b = b0; b < b1; b++) { s += freq[b]; c++; }
        if (!c && b0 < nBins) { s = freq[b0]; c = 1; }
        const raw = c ? s / (c * 255) : 0;
        if (specFloor[i] <= 1e-6) specFloor[i] = raw * 0.4;
        const scale = (dt || (1 / 60)) * 60;
        const down = 1 - Math.pow(1 - 0.06, scale);
        const up = 1 - Math.pow(1 - 0.0012, scale);
        if (raw < specFloor[i]) specFloor[i] += (raw - specFloor[i]) * down;
        else specFloor[i] += (raw - specFloor[i]) * up;
        specPeak[i] = Math.max(raw, specPeak[i] * Math.pow(0.993, scale));
        const denom = Math.max(0.07, specPeak[i] - specFloor[i]);
        specBands[i] = clamp((raw - specFloor[i] * 1.08) / denom, 0, 1);
      }
      // circular seam: blend first/last so 12 o'clock is not a hard join
      const a0 = specBands[0], a1 = specBands[1], b0 = specBands[n - 1], b1 = specBands[n - 2];
      const seam = (a0 + b0) * 0.5;
      specBands[0] = a0 * 0.5 + seam * 0.5;
      specBands[n - 1] = b0 * 0.5 + seam * 0.5;
      specBands[1] = a1 * 0.7 + specBands[0] * 0.3;
      specBands[n - 2] = b1 * 0.7 + specBands[n - 1] * 0.3;
      specTmp.set(specBands);
      for (let i = 0; i < n; i++) {
        const prev = specTmp[(i - 1 + n) % n];
        const next = specTmp[(i + 1) % n];
        specBands[i] = prev * 0.15 + specTmp[i] * 0.7 + next * 0.15;
      }
    }

    function bandAvgHz(lo, hi) {
      if (!freq || !audioCtx) return 0;
      const nBins = freq.length;
      const nyquist = audioCtx.sampleRate / 2;
      const hzPerBin = nyquist / nBins;
      const minBin = Math.max(1, Math.ceil(SPEC_MIN_HZ / hzPerBin));
      const a = Math.max(minBin, Math.floor(lo / hzPerBin));
      const b = Math.min(nBins, Math.ceil(hi / hzPerBin));
      if (b <= a) return 0;
      let s = 0, c = 0;
      for (let i = a; i < b; i++) { s += freq[i]; c++; }
      return c ? s / (c * 255) : 0;
    }

    function analyse(dt) {
      if (!analyser) return;
      analyser.getByteFrequencyData(freq);
      analyser.getByteTimeDomainData(timeDom);
      fillLogSpectrum(dt);

      const bass = bandAvgHz(30, 150);
      const mid = bandAvgHz(300, 2000);
      const high = bandAvgHz(4000, 12000);

      let rms = 0;
      for (let i = 0; i < timeDom.length; i++) {
        const v = (timeDom[i] - 128) / 128;
        rms += v * v;
      }
      rms = Math.sqrt(rms / timeDom.length);

      const energy = bass * 0.62 + mid * 0.28 + rms * 0.35;
      const flux = Math.max(0, bass - prevBassRaw);
      prevBassRaw = bass;
      const now = performance.now();
      const slot = fluxWin[fluxHead];
      slot.t = now;
      slot.v = flux;
      fluxHead = (fluxHead + 1) % FLUX_CAP;
      if (fluxCount < FLUX_CAP) fluxCount++;
      let fluxSum = 0, fluxN = 0;
      for (let i = 0; i < fluxCount; i++) {
        const item = fluxWin[(fluxHead - 1 - i + FLUX_CAP) % FLUX_CAP];
        if (now - item.t > 1000) break;
        fluxSum += item.v;
        fluxN++;
      }
      const fluxAvg = fluxN ? fluxSum / fluxN : 0.001;

      bands.bass = bass; bands.mid = mid; bands.high = high;
      bands.energy = energy; bands.rms = rms;
      bands.sBass = envFollowDt(bands.sBass, bass, 0.5, 0.08, dt);
      bands.sMid = envFollowDt(bands.sMid, mid, 0.5, 0.08, dt);
      bands.sHigh = envFollowDt(bands.sHigh, high, 0.5, 0.08, dt);
      bands.sEnergy = envFollowDt(bands.sEnergy, energy, 0.5, 0.08, dt);
      bands.sRms = envFollowDt(bands.sRms, rms, 0.5, 0.08, dt);

      avgEnergy = lerp(avgEnergy, energy, 0.045);
      const thresh = Math.max(0.012, fluxAvg * 1.4);
      if (flux > thresh && bass > 0.05 && now - lastBeat > 170) {
        const interval = now - lastBeat;
        lastBeat = now;
        if (interval > 200 && interval < 2000) {
          beatIntervals.push(interval);
          if (beatIntervals.length > 8) beatIntervals.shift();
          let acc = 0;
          for (let i = 0; i < beatIntervals.length; i++) acc += beatIntervals[i];
          bpm = clamp(60000 / (acc / beatIntervals.length), 40, 200);
        }
        onBeat(flux / Math.max(0.008, fluxAvg));
      }

      beatFlash = Math.max(0, beatFlash - dt * 2.6);
      wineVignette = Math.max(0, wineVignette - dt / 0.6);
      vignettePulse = Math.max(0, vignettePulse - dt / 0.6);
      eyeGlow = Math.max(0, eyeGlow - dt / 0.25);
      filmFlicker = Math.max(0, filmFlicker - dt * 30);
      slitShake = Math.max(0, slitShake - dt * 8);
      pulse = lerp(pulse, 0, 1 - Math.pow(0.0008, dt));
      wing = lerp(wing, 0, 1 - Math.pow(0.08, dt));
      const flickT = (Math.random() - 0.5) * (0.2 + bands.sMid * 0.5);
      flameFlicker = envFollowDt(flameFlicker, flickT, 0.5, 0.08, dt);
    }

  function onBeat(strength) {
    const s = clamp(strength, 0.6, 2.4);
    beatFlash = Math.min(1, 0.42 + s * 0.18);
    pulse = Math.min(1, pulse + 0.45 + s * 0.15);
    wing = Math.min(1, 0.55 + s * 0.35);
    eyeGlow = 1;
    slitShake = 1;
    vignettePulse = 1;
    filmFlicker = 2;
    const now = performance.now();
    if (!reducedMotion && now - lastWineFlash > 1500) {
      lastWineFlash = now;
      wineVignette = 1;
    }
    const n = Math.min(8, 3 + (s * 3) | 0);
    for (let i = 0; i < n; i++) spawnParticle(true);
  }

    function spawnParticle(emberForce) {
      if (particles.length >= MAX_PARTICLES) particles.shift();
      const high = bands.sHigh;
      const ember = emberForce || Math.random() < 0.35 + high * 0.5;
      const fp = getFlamePos();
      const sc = mode <= 3 ? Math.max(0.55, (bannerRect.h || H) / 1080) : 1;
      particles.push({
        x: fp.baseX + rand(-8, 8) * sc,
        y: fp.baseY - rand(4, 16) * sc,
        vx: rand(-10, 10) * sc,
        vy: (ember ? rand(-46, -22) : rand(-32, -14)) * sc,
        life: 1,
        decay: ember ? rand(1 / 3, 1 / 1.5) : rand(0.2, 0.35),
        size: (ember ? rand(1, 3) : rand(5, 12)) * sc,
        ember,
        wob: rand(0, Math.PI * 2)
      });
    }

    function flameBaseY() {
      if (mode === 5) return H * 0.72;
      if (mode === 6) return H * 0.58;
      return H * 0.66;
    }

    function coverRect(viewW, viewH, imgW, imgH, zoom, focusX, focusY) {
      const scale = Math.max(viewW / imgW, viewH / imgH) * (zoom || 1);
      const w = imgW * scale;
      const h = imgH * scale;
      const fx = focusX == null ? 0.5 : focusX;
      const fy = focusY == null ? 0.5 : focusY;
      let x = viewW * 0.5 - fx * w;
      let y = viewH * 0.5 - fy * h;
      if (w >= viewW) x = clamp(x, viewW - w, 0);
      else x = (viewW - w) / 2;
      if (h >= viewH) y = clamp(y, viewH - h, 0);
      else y = (viewH - h) / 2;
      return { x: x, y: y, w: w, h: h, scale: scale };
    }

    function mapImg(nx, ny, rect) {
      return [rect.x + nx * rect.w, rect.y + ny * rect.h];
    }

    function isPortrait() { return H > W; }

    function computeBannerRect() {
      const vertical = recLayout === "vertical" || isPortrait();
      bannerRect = coverRect(
        W, H, BANNER.w, BANNER.h, 1,
        vertical ? BANNER.vertFocusX : 0.5,
        vertical ? BANNER.vertFocusY : 0.5
      );
      return bannerRect;
    }

    function getFlamePos() {
      if (mode <= 3) {
        computeBannerRect();
        const c = mapImg(BANNER.flameX, BANNER.flameY, bannerRect);
        const b = mapImg(BANNER.flameX, BANNER.flameBaseY, bannerRect);
        return { x: c[0], y: c[1], baseX: b[0], baseY: b[1] };
      }
      const y = flameBaseY();
      return { x: W * 0.5, y: y, baseX: W * 0.5, baseY: y };
    }

    function getVoidPos() {
      computeBannerRect();
      const vertical = recLayout === "vertical" || isPortrait();
      const p = mapImg(
        vertical ? BANNER.vertVoidX : BANNER.voidX,
        vertical ? BANNER.vertVoidY : BANNER.voidY,
        bannerRect
      );
      return { x: p[0], y: p[1] };
    }

    function drawSpectrumRing(cx, cy, radius, maxLen) {
      const n = SPEC_BANDS;
      const breathe = 1 + bands.sRms * 0.12 * sensitivity;
      const R = radius * breathe;
      const restOp = 0.15;
      const maxOp = 0.45;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-Math.PI / 2);
      ctx.lineCap = "round";
      const energy = clamp(bands.sEnergy * sensitivity, 0, 1);
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const v = specBands[i % n] * sensitivity;
        const len = (0.35 + v * 0.65) * maxLen * 0.45;
        const ang = (i / n) * Math.PI * 2;
        const rr = R + len;
        const x = Math.cos(ang) * rr, y = Math.sin(ang) * rr;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = rgba(pal.cream, restOp + (maxOp - restOp) * energy);
      ctx.lineWidth = 1.15;
      ctx.stroke();
      for (let i = 0; i < n; i++) {
        const v = clamp(specBands[i] * sensitivity, 0, 1);
        const len = 3 + v * maxLen;
        const ang = (i / n) * Math.PI * 2;
        const x0 = Math.cos(ang) * R, y0 = Math.sin(ang) * R;
        const x1 = Math.cos(ang) * (R + len), y1 = Math.sin(ang) * (R + len);
        const tt = i / (n - 1);
        const ca = hexRgb(pal.amber), cw = hexRgb(pal.wine);
        const r = Math.round(lerp(ca[0], cw[0], tt));
        const g = Math.round(lerp(ca[1], cw[1], tt));
        const b = Math.round(lerp(ca[2], cw[2], tt));
        const op = restOp + (maxOp - restOp) * v;
        ctx.strokeStyle = "rgba(" + r + "," + g + "," + b + "," + op + ")";
        ctx.lineWidth = 1 + v;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawBannerImage() {
      if (assetsReady < 1) return;
      const r = computeBannerRect();
      ctx.drawImage(bannerImg, r.x, r.y, r.w, r.h);
    }

    function drawSoftFlameGlow() {
      const r = bannerRect;
      const bass = bands.sBass * sensitivity;
      const mid = bands.sMid * sensitivity;
      const p = mapImg(BANNER.flameX, BANNER.flameY, r);
      const fx = p[0], fy = p[1];
      const scale = r.w / 2560;
      const rad = lerp(180, 420, clamp(bass, 0, 1)) * scale;
      const flick = 1 + flameFlicker * 0.03;
      const idle = running ? 1 : 0.4;
      const a = (0.42 + bass * 0.5 + mid * 0.15) * idle;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.translate(fx, fy);
      ctx.scale(1, flick);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rad);
      const core = hexRgb(pal.core), amb = hexRgb(pal.amber);
      g.addColorStop(0, "rgba(" + core[0] + "," + core[1] + "," + core[2] + "," + (0.72 * a) + ")");
      g.addColorStop(0.12, "rgba(" + amb[0] + "," + amb[1] + "," + amb[2] + "," + (0.4 * a) + ")");
      g.addColorStop(0.32, "rgba(" + amb[0] + "," + amb[1] + "," + amb[2] + "," + (0.16 * a) + ")");
      g.addColorStop(0.58, "rgba(" + amb[0] + "," + amb[1] + "," + amb[2] + "," + (0.05 * a) + ")");
      g.addColorStop(1, "rgba(" + amb[0] + "," + amb[1] + "," + amb[2] + ",0)");
      ctx.fillStyle = g;
      const ext = rad * 1.02;
      ctx.fillRect(-ext, -ext, ext * 2, ext * 2);
      ctx.restore();
    }

    function drawLivingSmoke(time) {
      if (assetsReady < 2) return;
      const r = bannerRect;
      const mid = bands.sMid * sensitivity;
      const amp = (reducedMotion ? 1 : (2 + mid * 4)) * (r.w / 1920);
      const sh = smokeImg.naturalHeight || BANNER.h;
      const sw = smokeImg.naturalWidth || BANNER.w;
      const scroll = smokeScroll % sh;
      if (!drawLivingSmoke._c) drawLivingSmoke._c = document.createElement("canvas");
      const oc = drawLivingSmoke._c;
      const longest = Math.max(r.w, r.h, 1);
      const fit = Math.min(1, (960 * quality) / longest);
      const ow = Math.max(2, (r.w * fit) | 0);
      const oh = Math.max(2, (r.h * fit) | 0);
      if (oc.width !== ow || oc.height !== oh) { oc.width = ow; oc.height = oh; }
      const octx = oc.getContext("2d");
      octx.setTransform(1, 0, 0, 1, 0, 0);
      octx.clearRect(0, 0, ow, oh);
      const yScale = oh / r.h;
      const xScale = ow / r.w;
      const strip = Math.max(2, smokeStrip * yScale);
      for (let y = 0; y < oh; y += strip) {
        const cssY = y / yScale;
        const srcY0 = ((cssY + scroll) % sh + sh) % sh;
        const hDraw = Math.min(strip, oh - y);
        const cssH = hDraw / yScale;
        const dx = Math.sin((cssY + r.y) * 0.012 + time * 0.6) * amp * xScale;
        const avail = sh - srcY0;
        const need = cssH * (sh / r.h);
        if (avail >= need) {
          const srcH = Math.max(1, Math.min(need, avail));
          octx.drawImage(smokeImg, 0, srcY0, sw, srcH, dx, y, ow, hDraw);
        } else {
          const srcH1 = Math.max(1, avail);
          const h1 = srcH1 * (oh / sh);
          octx.drawImage(smokeImg, 0, srcY0, sw, srcH1, dx, y, ow, h1);
          const rest = hDraw - h1;
          if (rest > 0.5) {
            octx.drawImage(smokeImg, 0, 0, sw, Math.max(1, rest * (sh / oh)), dx, y + h1, ow, rest);
          }
        }
      }
      octx.globalCompositeOperation = "source-in";
      octx.fillStyle = "rgb(217,217,217)";
      octx.fillRect(0, 0, ow, oh);
      octx.globalCompositeOperation = "source-over";
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(oc, r.x, r.y, r.w, r.h);
      ctx.restore();
    }

    function drawFilmSweep(time, dt) {
      if (assetsReady < 3 || !FILM_PATH.length) return;
      const r = bannerRect;
      const speed = (bpm / 60) * 0.18;
      filmSweep = (filmSweep + speed * dt * (reducedMotion ? 0.3 : 1)) % 1;
      const pts = FILM_PATH;
      const idx = filmSweep * (pts.length - 1);
      const i0 = Math.floor(idx);
      const i1 = Math.min(pts.length - 1, i0 + 1);
      const tt = idx - i0;
      const nx = pts[i0][0] + (pts[i1][0] - pts[i0][0]) * tt;
      const ny = pts[i0][1] + (pts[i1][1] - pts[i0][1]) * tt;
      const jx = r.x + nx * r.w;
      const jy = r.y + ny * r.h;
      const band = 120 * (r.w / 2560);
      if (!drawFilmSweep._c) {
        drawFilmSweep._c = document.createElement("canvas");
      }
      const oc = drawFilmSweep._c;
      const longest = Math.max(r.w, r.h, 1);
      const fit = Math.min(1, (1100 * quality) / longest);
      const ow = Math.max(2, (r.w * fit) | 0);
      const oh = Math.max(2, (r.h * fit) | 0);
      if (oc.width !== ow || oc.height !== oh) { oc.width = ow; oc.height = oh; }
      const octx = oc.getContext("2d");
      octx.setTransform(1, 0, 0, 1, 0, 0);
      octx.clearRect(0, 0, ow, oh);
      const gx = (jx - r.x) * fit;
      const gy = (jy - r.y) * fit;
      const g = octx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(1, band * fit));
      const cream = hexRgb(pal.cream);
      const a = 0.25 * (filmFlicker > 0 && !reducedMotion ? 1.35 : 1);
      g.addColorStop(0, "rgba(" + cream[0] + "," + cream[1] + "," + cream[2] + "," + a + ")");
      g.addColorStop(0.55, "rgba(" + cream[0] + "," + cream[1] + "," + cream[2] + "," + (a * 0.25) + ")");
      g.addColorStop(1, "rgba(" + cream[0] + "," + cream[1] + "," + cream[2] + ",0)");
      octx.fillStyle = g;
      octx.fillRect(0, 0, ow, oh);
      octx.globalCompositeOperation = "destination-in";
      octx.drawImage(filmImg, 0, 0, ow, oh);
      octx.globalCompositeOperation = "source-over";
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(oc, r.x, r.y, r.w, r.h);
      ctx.restore();
    }

    function drawEyeGlint() {
      const p = mapImg(BANNER.eyeX, BANNER.eyeY, bannerRect);
      const x = p[0], y = p[1];
      if (x < -20 || y < -20 || x > W + 20 || y > H + 20) return;
      const sc = bannerRect.w / 1920;
      const coreR = (6 + eyeGlow * 4) * (sc * 1920 / 2560);
      const glowR = 30 * (sc * 1920 / 2560);
      const a = 0.12 + eyeGlow * 0.7;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const g = ctx.createRadialGradient(x, y, 0, x, y, glowR);
      const core = hexRgb(pal.core), amb = hexRgb(pal.amber);
      g.addColorStop(0, "rgba(" + core[0] + "," + core[1] + "," + core[2] + "," + Math.min(0.85, a) + ")");
      g.addColorStop(coreR / glowR, "rgba(" + amb[0] + "," + amb[1] + "," + amb[2] + "," + (0.35 * a) + ")");
      g.addColorStop(1, "rgba(" + amb[0] + "," + amb[1] + "," + amb[2] + ",0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - glowR, y - glowR, glowR * 2, glowR * 2);
      ctx.restore();
    }

    function drawWineEdgeVignette() {
      if (wineVignette <= 0) return;
      const a = Math.min(0.35, wineVignette * 0.35);
      const g = ctx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.28, W * 0.5, H * 0.5, Math.max(W, H) * 0.72);
      g.addColorStop(0, rgba(pal.wineDeep, 0));
      g.addColorStop(0.55, rgba(pal.wineDeep, a * 0.35));
      g.addColorStop(1, rgba(pal.wineDeep, a));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    function drawBreathVignette() {
      const e = bands.sEnergy * sensitivity;
      const pulseA = vignettePulse * 0.12;
      const dark = clamp(0.7 - e * 0.22 - pulseA, 0.32, 0.8);
      const g = ctx.createRadialGradient(W * 0.5, H * 0.45, Math.min(W, H) * 0.16, W * 0.5, H * 0.5, Math.max(W, H) * 0.74);
      g.addColorStop(0, "rgba(11,10,9,0)");
      g.addColorStop(0.62, "rgba(11,10,9," + (dark * 0.2) + ")");
      g.addColorStop(1, "rgba(11,10,9," + dark + ")");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    function drawGrainAndExposure() {
      if (reducedMotion) return;
      const a = 0.04 + 0.02 * (0.5 + bands.sRms * 0.5);
      if (grainImg.complete && grainImg.naturalWidth) {
        if (!drawGrainAndExposure._pat) {
          drawGrainAndExposure._pat = ctx.createPattern(grainImg, "repeat");
        }
        const pat = drawGrainAndExposure._pat;
        if (pat) {
          ctx.save();
          ctx.globalAlpha = a;
          ctx.globalCompositeOperation = "overlay";
          const gw = grainImg.naturalWidth, gh = grainImg.naturalHeight;
          const ox = ((performance.now() * 0.035) | 0) % gw;
          const oy = ((performance.now() * 0.027) | 0) % gh;
          ctx.translate(ox, oy);
          ctx.fillStyle = pat;
          ctx.fillRect(-ox, -oy, W + gw, H + gh);
          ctx.restore();
        }
      }
      const exp = flameFlicker * 0.02;
      if (exp > 0.001) {
        ctx.fillStyle = "rgba(255,248,230," + exp + ")";
        ctx.fillRect(0, 0, W, H);
      } else if (exp < -0.001) {
        ctx.fillStyle = "rgba(0,0,0," + (-exp) + ")";
        ctx.fillRect(0, 0, W, H);
      }
    }

    function drawPortada(time, dt) {
      computeBannerRect();
      drawBannerImage();
      drawSoftFlameGlow();
      drawLivingSmoke(time);
      drawFilmSweep(time, dt);
      const vp = getVoidPos();
      const ringR = BANNER.ringR * bannerRect.w;
      const ringLen = ringR * 0.42;
      drawSpectrumRing(vp.x, vp.y, ringR, ringLen);
      drawEyeGlint();
      drawParticles(dt);
      drawWineEdgeVignette();
      drawBreathVignette();
      drawGrainAndExposure();
    }

    function drawParticles(dt) {
      const spawnBudget = bands.sHigh * sensitivity * 8 + bands.sBass * 2;
      if (running && Math.random() < Math.min(0.65, 0.08 + spawnBudget * 0.08)) spawnParticle(false);
      if (running && bands.sHigh * sensitivity > 0.2 && Math.random() < 0.25) spawnParticle(true);

      ctx.save();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= p.decay * dt;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        p.wob += dt * 3;
        p.x += (p.vx + Math.sin(p.wob) * (p.ember ? 8 : 16)) * dt;
        p.y += p.vy * dt;
        p.vy -= 6 * dt;
        const a = clamp(p.life, 0, 1);
        if (p.ember) {
          ctx.globalCompositeOperation = "lighter";
          ctx.fillStyle = "rgba(245,197,106," + (0.75 * a) + ")";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(255,244,200," + (0.5 * a) + ")";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.globalCompositeOperation = "source-over";
          const r = p.size * (1.4 - a * 0.4);
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
          g.addColorStop(0, "rgba(200,190,170," + (0.14 * a) + ")");
          g.addColorStop(1, "rgba(20,18,16,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

  function backingSize() {
    const cssW = window.innerWidth || 1920;
    const cssH = window.innerHeight || 1080;
    const raw = window.devicePixelRatio || 1;
    let bw = cssW * raw * quality;
    let bh = cssH * raw * quality;
    const cap = Math.min(1, 3840 / Math.max(bw, 1), 2160 / Math.max(bh, 1));
    bw = Math.max(1, Math.floor(bw * cap));
    bh = Math.max(1, Math.floor(bh * cap));
    return { cssW: cssW, cssH: cssH, bw: bw, bh: bh };
  }

  function resize() {
    const box = backingSize();
    W = box.cssW;
    H = box.cssH;
    dpr = box.bw / box.cssW;
    canvas.width = box.bw;
    canvas.height = box.bh;
    smokeStrip = quality < 0.99 ? 8 : 5;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function noteWork(ms) {
    workSum += ms;
    workN++;
    window.__eamWork = workSum / workN;
    if (drawnFrames < 45) return;
    if (ms > 20) {
      slowStreak++;
      if (slowStreak >= 8 && quality > 0.56) {
        quality = Math.max(0.56, quality * 0.75);
        slowStreak = 0;
        resize();
      }
    } else {
      slowStreak = 0;
    }
  }

  function idleDrive(time, dt) {
    const calm = reducedMotion ? 0.45 : 1;
    const breath = 0.5 + 0.5 * Math.sin(time * 0.55 * calm);
    const second = 0.5 + 0.5 * Math.sin(time * 0.22 * calm + 1.2);
    bands.sBass = envFollowDt(bands.sBass, (0.045 + breath * 0.07) * calm, 0.12, 0.12, dt);
    bands.sMid = envFollowDt(bands.sMid, (0.035 + second * 0.05) * calm, 0.12, 0.12, dt);
    bands.sHigh = envFollowDt(bands.sHigh, 0.015 * calm, 0.12, 0.12, dt);
    bands.sEnergy = envFollowDt(bands.sEnergy, (0.04 + breath * 0.06) * calm, 0.12, 0.12, dt);
    bands.sRms = envFollowDt(bands.sRms, (0.03 + breath * 0.045) * calm, 0.12, 0.12, dt);
    const flick = Math.sin(time * (reducedMotion ? 3 : 9.2)) * 0.14 * calm
      + Math.sin(time * (reducedMotion ? 4.6 : 13.4)) * 0.05 * calm;
    flameFlicker = envFollowDt(flameFlicker, flick, 0.45, 0.12, dt);
    beatFlash = Math.max(0, beatFlash - dt * 2.6);
    wineVignette = Math.max(0, wineVignette - dt / 0.6);
    vignettePulse = Math.max(0, vignettePulse - dt / 0.6);
    eyeGlow = Math.max(0, eyeGlow - dt / 0.25);
    filmFlicker = Math.max(0, filmFlicker - dt * 30);
    pulse = lerp(pulse, breath * 0.18 * calm, 1 - Math.pow(0.02, dt));
    const amp = reducedMotion ? 0.035 : (0.05 + breath * 0.07);
    for (let i = 0; i < SPEC_BANDS; i++) {
      specBands[i] = amp * (0.62 + 0.38 * Math.sin(time * 0.75 + i * 0.2));
    }
  }

  function frame(now) {
    if (hiddenPause) { raf = 0; return; }
    raf = requestAnimationFrame(frame);
    if (!lastT) lastT = now;
    const dt = clamp((now - lastT) / 1000, 0.001, 0.05);
    lastT = now;
    const time = (now - t0) / 1000;
    const work0 = performance.now();

    if (running) analyse(dt);
    else idleDrive(time, dt);

    if (!reducedMotion) smokeScroll += 0.15 * dt * 60;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = pal.carbon;
    ctx.fillRect(0, 0, W, H);
    drawPortada(time, dt);

    drawnFrames++;
    window.__eamFrames = drawnFrames;
    window.__eamQuality = quality;
    noteWork(performance.now() - work0);
  }

  function ensureAudio() {
    if (audioCtx) {
      if (audioCtx.state === "suspended") audioCtx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioCtx = new AC();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    analyser.minDecibels = -90;
    analyser.maxDecibels = -20;
    freq = new Uint8Array(analyser.frequencyBinCount);
    timeDom = new Uint8Array(analyser.fftSize);
    sourceNode = audioCtx.createMediaElementSource(audioEl);
    gainNode = audioCtx.createGain();
    sourceNode.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    applyGain();
    if (audioCtx.state === "suspended") audioCtx.resume();
  }

  function sameOriginAudio(src) {
    if (!src || typeof src !== "string") return null;
    try {
      const url = new URL(src, window.location.href);
      if (url.origin !== window.location.origin) return null;
      if (url.pathname.indexOf("/visualizer/audio/") === -1) return null;
      return url.href;
    } catch (e) {
      return null;
    }
  }

  function setPlayVisible(show) {
    [prevBtn, playBtn, nextBtn].forEach(function (btn) {
      btn.hidden = !show;
      btn.disabled = !show;
    });
  }

  function readVolume() {
    try {
      var stored = localStorage.getItem("eam-visualizer-volume");
      if (stored != null && stored !== "" && !isNaN(Number(stored))) {
        volume = clamp(Number(stored), 0, 1);
        if (volume > 0) lastNonZero = volume;
      }
      muted = localStorage.getItem("eam-visualizer-muted") === "1";
    } catch (e) {}
    volumeInput.value = String(volume);
    paintMute();
  }

  function saveVolume() {
    try {
      localStorage.setItem("eam-visualizer-volume", String(volume));
      localStorage.setItem("eam-visualizer-muted", muted ? "1" : "0");
    } catch (e) {}
  }

  function applyGain() {
    if (!gainNode || !audioCtx) return;
    gainNode.gain.setValueAtTime(muted || volume === 0 ? 0 : volume, audioCtx.currentTime);
  }

  function paintMute() {
    var silent = muted || volume === 0;
    muteBtn.classList.toggle("is-muted", silent);
    muteBtn.setAttribute("aria-pressed", silent ? "true" : "false");
    muteBtn.setAttribute("aria-label", silent ? "Unmute" : "Mute");
  }

  function currentItem() {
    return playlist[trackIndex] || null;
  }

  function showNow(on) {
    var el = document.getElementById("now-playing");
    if (!el) return;
    var item = currentItem();
    if (!on || !item) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    el.classList.toggle("is-preview", !!item.preview);
    document.getElementById("now-album").textContent = item.album || "";
    document.getElementById("now-title").textContent = item.title || "";
  }

  function setPlayingUI(on) {
    playBtn.textContent = on ? "Pause" : "Play";
    playBtn.setAttribute("aria-pressed", on ? "true" : "false");
    playBtn.setAttribute("aria-label", on ? "Pause" : "Play");
    showNow(on);
  }

  function cue(index) {
    if (!playlist.length) return;
    trackIndex = (index % playlist.length + playlist.length) % playlist.length;
  }

  function playCurrent() {
    if (!playlist.length) return;
    ensureAudio();
    var item = currentItem();
    if (assignedSrc !== item.src) {
      audioEl.src = item.src;
      assignedSrc = item.src;
    }
    audioEl.play().then(function () {
      running = true;
      setPlayingUI(true);
    }).catch(function () {
      running = false;
      setPlayingUI(false);
    });
  }

  function step(delta) {
    if (!playlist.length) return;
    cue(trackIndex + delta);
    if (running) playCurrent();
  }

  function pausePlayback() {
    audioEl.pause();
    running = false;
    setPlayingUI(false);
  }

  function togglePlay() {
    if (!playlist.length) return;
    if (running) pausePlayback();
    else playCurrent();
  }

  function toggleFullscreen() {
    const root = document.documentElement;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(function () {});
    } else if (root.requestFullscreen) {
      root.requestFullscreen().catch(function () {});
    }
    syncFullscreenLabel();
  }

  function syncFullscreenLabel() {
    const on = !!document.fullscreenElement;
    fsBtn.textContent = on ? "Exit" : "Fullscreen";
    fsBtn.setAttribute("aria-label", on ? "Exit fullscreen" : "Fullscreen");
    fsBtn.setAttribute("aria-pressed", on ? "true" : "false");
  }

  function syncCursorHide() {
    var idle = controls.classList.contains("is-idle");
    document.documentElement.classList.toggle("cursor-hidden", !!(document.fullscreenElement && idle));
  }

  function revealControls() {
    controls.classList.remove("is-idle");
    document.documentElement.classList.remove("cursor-hidden");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      controls.classList.add("is-idle");
      syncCursorHide();
    }, 3200);
  }

  function nudge(event) {
    event.stopPropagation();
    revealControls();
  }
  prevBtn.addEventListener("click", function (event) { nudge(event); step(-1); });
  playBtn.addEventListener("click", function (event) { nudge(event); togglePlay(); });
  nextBtn.addEventListener("click", function (event) { nudge(event); step(1); });
  muteBtn.addEventListener("click", function (event) {
    nudge(event);
    muted = !muted;
    if (!muted && volume === 0) {
      volume = lastNonZero || 0.6;
      volumeInput.value = String(volume);
    }
    saveVolume();
    applyGain();
    paintMute();
  });
  volumeInput.addEventListener("input", function () {
    volume = clamp(Number(volumeInput.value), 0, 1);
    if (volume > 0) lastNonZero = volume;
    muted = volume === 0;
    saveVolume();
    applyGain();
    paintMute();
    revealControls();
  });
  fsBtn.addEventListener("click", function (event) {
    nudge(event);
    toggleFullscreen();
  });
  document.addEventListener("keydown", function (event) {
    var tag = event.target && event.target.tagName;
    if (tag === "TEXTAREA") return;
    if (tag === "INPUT" && event.target.type !== "range") return;
    if (event.key === " " || event.code === "Space") {
      event.preventDefault();
      togglePlay();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      if (event.target === volumeInput) return;
      event.preventDefault();
      volume = clamp(volume + (event.key === "ArrowUp" ? 0.05 : -0.05), 0, 1);
      if (volume > 0) lastNonZero = volume;
      muted = volume === 0;
      volumeInput.value = String(volume);
      saveVolume();
      applyGain();
      paintMute();
    }
  });
  document.addEventListener("fullscreenchange", function () {
    syncFullscreenLabel();
    syncCursorHide();
  });
  window.addEventListener("pointermove", revealControls);
  window.addEventListener("pointerdown", revealControls);
  audioEl.addEventListener("ended", function () {
    if (!playlist.length) return;
    cue(trackIndex + 1);
    playCurrent();
  });

  document.addEventListener("visibilitychange", function () {
    hiddenPause = document.hidden;
    if (hiddenPause) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      lastT = 0;
    } else if (!raf) {
      lastT = 0;
      raf = requestAnimationFrame(frame);
    }
  });

  window.addEventListener("resize", resize);
  resize();
  readVolume();
  revealControls();
  setPlayVisible(false);
  raf = requestAnimationFrame(frame);

  fetch("playlist.json")
    .then(function (response) { return response.ok ? response.json() : []; })
    .catch(function () { return []; })
    .then(function (data) {
      playlist.length = 0;
      function pushItems(list, preview) {
        if (!Array.isArray(list)) return;
        for (let i = 0; i < list.length; i++) {
          const item = list[i] || {};
          const href = sameOriginAudio(item.src);
          if (!href) continue;
          playlist.push({
            album: item.album || "",
            title: item.title || "Track",
            src: href,
            preview: !!preview
          });
        }
      }
      if (Array.isArray(data)) pushItems(data, false);
      else if (data && typeof data === "object") {
        pushItems(data.tracks, false);
        pushItems(data.previews, true);
      }
      if (!playlist.length) {
        setPlayVisible(false);
        return;
      }
      setPlayVisible(true);
      setPlayingUI(false);
      cue(0);
    });
})();

// last piece standing.js

// Başlangıçta gösterilecek kutular
document.getElementById("startBtn").onclick = function() {
  document.getElementById("startContainer").style.display = "none";
  document.getElementById("bilgiKutusu").style.display = "flex";
};

   document.getElementById("bilgiTamamBtn").onclick = function() {
  document.getElementById("bilgiKutusu").style.display = "none";
  document.getElementById("nasilKutusu").style.display = "flex";
};


document.getElementById("nasilTamamBtn").onclick = function() {
  document.getElementById("nasilKutusu").style.display = "none";
  document.getElementById("myCanvas").style.display = "block";
  startGame();
};

//canvas ve context ayarları
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    var myGamePieces = [];
    let count=0;
    let filSecildi = false;
    let kaleSecildi=false;
    let atSecildi=false;
    let seciliAt = null;
    let bsah, bfil, bkale, b_at, b_at1, sfil1, sfil2, ssah;
    let oyunBitti = false;

    // Level geçişi için değişkenler
    let levelTransition = {
      active: false,
      phase: 0,
      timer: 0,
      delay: 60
    };
    let transitionX = 0;
    let transitionDirection = -1;

    let hareketSesi = new Audio("assets/hareket.mp3");
    let yutmaSesi = new Audio("assets/yutma.mp3");

    // Resim yükleme
    const arkaplanImg = new Image();
    arkaplanImg.src = "assets/arkaplan8.png";
    const sah = new Image();
    sah.src = "assets/w_kingg.png";
    const piyon = new Image();
    piyon.src="assets/b_pawn.png";
    const fil = new Image();
    fil.src = "assets/w_bishop.png";
    const kale = new Image();
    kale.src="assets/w_rook.png";

    // Oyun alanı
    var myGameArea = {
      start : function(){
        this.interval=setInterval(updateGameArea,20);
      },
      clear : function(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
      }
    }

//Oyun nesnesi tanımı
    function component(width, height, gridX, gridY, imgsrc, tur) {
      this.width = width;
      this.height = height;
      this.gridX = gridX;
      this.gridY = gridY;
      this.x = (gridX * width) + 300;
      this.y = gridY * height;
      this.targetX = this.x;
      this.targetY = this.y;
      this.image = new Image();
      this.image.src = imgsrc;
      this.tur = tur;

      this.update = function() {
        if (this.tur === "piyon" || this.tur === "s_sah") {
          this.targetX = (this.gridX * this.width) + 300;
          this.targetY = this.gridY * this.height;
          const speed = 10;
          if (Math.abs(this.x - this.targetX) > speed) {
            this.x += (this.targetX > this.x ? speed : -speed);
          } else {
            this.x = this.targetX;
          }
          if (Math.abs(this.y - this.targetY) > speed) {
            this.y += (this.targetY > this.y ? speed : -speed);
          } else {
            this.y = this.targetY;
          }
        } else {
          this.x = (this.gridX * this.width) + 300;
          this.y = this.gridY * this.height;
        }
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      }
    }

    const kare = 87.5;
    const tahtaboyutu = 8;


// Satranç tahtası çizimi    
    function tahtaCiz() {
      for (let x = 0; x < tahtaboyutu; x++) {
        for (let y = 0; y < tahtaboyutu; y++) {
          ctx.fillStyle = (x + y) % 2 === 0 ? "white" : "black";
          ctx.fillRect((x * kare + 300), y * kare, kare, kare);
          ctx.strokeStyle="black";
          ctx.strokeRect((x * kare + 300), y * kare, kare, kare);
        }
      }
    }

 
// Şahın hareket edebileceği kareleri boyayan fonksiyon
    function kareboya(){
      // bsah.x'den 300 çıkararak doğru satır ve sütun hesaplanır
      const satir = Math.floor((bsah.x - 300) / kare);
      const sutun = Math.floor(bsah.y / kare);
    
      if (filSecildi) {
    // 4 çapraz yön: sağ üst, sol üst, sağ alt, sol alt
    const directions = [
      {dx: 1, dy: 1},
      {dx: 1, dy: -1},
      {dx: -1, dy: 1},
      {dx: -1, dy: -1}
    ];
    for (const dir of directions) {
      let x = satir + dir.dx;
      let y = sutun + dir.dy;
      while (x >= 0 && x < tahtaboyutu && y >= 0 && y < tahtaboyutu) {
        myGamePieces.some(tas => tas.gridX === x && tas.gridY === y);
        ctx.fillStyle = "red";
        ctx.fillRect(x * kare + 300, y * kare, kare, kare);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        ctx.strokeRect(x * kare + 300, y * kare, kare, kare);
         if (myGamePieces.some(tas => tas.gridX === x && tas.gridY === y)) break; // Taş varsa bu yönde devam etme
        x += dir.dx;
        y += dir.dy;
      }
    }
  }
  else if (kaleSecildi) {
    // 4 yön: sağ, sol, aşağı, yukarı
    const directions = [
      {dx: 1, dy: 0},   // sağ
      {dx: -1, dy: 0},  // sol
      {dx: 0, dy: 1},   // aşağı
      {dx: 0, dy: -1}   // yukarı
    ];
    for (const dir of directions) {
      let x = satir + dir.dx;
      let y = sutun + dir.dy;
      while (x >= 0 && x < tahtaboyutu && y >= 0 && y < tahtaboyutu) {
        if (x === satir && y === sutun) {
          x += dir.dx;
          y += dir.dy;
          continue;
        }
        ctx.fillStyle = "red";
        ctx.fillRect(x * kare + 300, y * kare, kare, kare);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        ctx.strokeRect(x * kare + 300, y * kare, kare, kare);
        if (myGamePieces.some(tas => tas.gridX === x && tas.gridY === y)) break; // Taş varsa bu yönde devam etme
        x += dir.dx;
        y += dir.dy;
      }
    }
   
  }
    else if (atSecildi) {
    // Satranç atı hareketleri (L şeklinde)
    const atHareketleri = [
      {dx: -2, dy: 1}, {dx: -1, dy: 2}, {dx: 1, dy: 2}, {dx: 2, dy: 1},
      {dx: -2, dy: -1}, {dx: -1, dy: -2}, {dx: 1, dy: -2}, {dx: 2, dy: -1}
    ];
    for (const hareket of atHareketleri) {
      let x = satir + hareket.dx;
      let y = sutun + hareket.dy;
      if (x >= 0 && x < tahtaboyutu && y >= 0 && y < tahtaboyutu) {
        ctx.fillStyle = "red";
        ctx.fillRect(x * kare + 300, y * kare, kare, kare);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        ctx.strokeRect(x * kare + 300, y * kare, kare, kare);
      }
    
    }
  }
    else {
      for(let x=0 ; x<tahtaboyutu ; x++){
        for(let y=0 ; y<tahtaboyutu ; y ++){
          if((x > satir - 2) && (x < satir + 2) && (y > sutun - 2) && (y < sutun + 2)){
            if((x !==satir) || (y!==sutun)){
              ctx.fillStyle="red";
              ctx.fillRect(x * kare + 300, y * kare, kare, kare);
              ctx.lineWidth=2;
              ctx.strokeStyle="black";
              ctx.strokeRect(x * kare + 300, y * kare, kare, kare);
          
          }
          }
        }
      }
 }
}

// sfil ok hedeflerini tutan global dizi
let okHedefleri = [];
// s_at ok hedeflerini tutan global dizi
let sAtOkHedefleri = [];
// piyon ok hedeflerini tutan global dizi
let piyonOkHedefleri = [];

// Taşların hareket edeceği yerin oklarını çizen fonksiyon
// Bu Fonksiyon neredeyse tamamen ChatGPT tarafından yazılmıştır ama co-pilot kullandığım için linki atamıyorum maalesef
 function okciz() {
  okHedefleri = [];
  sAtOkHedefleri = [];
  piyonOkHedefleri = [];
  let tumOklar = []; // Tüm ok hedeflerini burada topla

  for (let i = 0; i < myGamePieces.length; i++) {
    const tas = myGamePieces[i];

    // --- PİYON ---
    if (tas.tur === "piyon" || tas.tur === "s_sah") {
      // Sadece 1 kare ileri (önü dolu olsa da ok çizilecek)
      let hedef = { x: tas.gridX, y: tas.gridY + 1 };
      // Sadece başka bir ok aynı kareye çizilmesin
      if (
        tas.gridY < tahtaboyutu - 1 &&
        !tumOklar.some(ok => ok.x === hedef.x && ok.y === hedef.y)
      ) {
        piyonOkHedefleri.push(hedef);
        tumOklar.push(hedef);

        // Ok çiz
        const fromX = tas.gridX * kare + 300 + kare / 2;
        const fromY = tas.gridY * kare + kare / 2;
        const toX = hedef.x * kare + 300 + kare / 2;
        const toY = hedef.y * kare + kare / 2;

        ctx.lineWidth = 5;
        ctx.strokeStyle = "blue";
        ctx.fillStyle = "blue";

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - 10, toY - 15);
        ctx.lineTo(toX + 10, toY - 15);
        ctx.closePath();
        ctx.fill();
      } else {
        piyonOkHedefleri.push(hedef);
      }
    }

    // --- SFIL ---
    else if (tas.tur === "sfil") {
      let x = tas.gridX;
      let y = tas.gridY;
      let hedefler = [];
      // Sağ alt çapraz
      let dx = x, dy = y;
      while (
        dx < 7 && dy < 7 &&
        !myGamePieces.some(t => t.gridX === dx + 1 && t.gridY === dy + 1)
      ) {
        dx++; dy++;
        hedefler.push({ x: dx, y: dy });
      }
      // Sol alt çapraz
      dx = x; dy = y;
      while (
        dx > 0 && dy < 7 &&
        !myGamePieces.some(t => t.gridX === dx - 1 && t.gridY === dy + 1)
      ) {
        dx--; dy++;
        hedefler.push({ x: dx, y: dy });
      }
      // En aşağıya inenlerden biri
      hedefler = hedefler.filter(h => h.y > y);
      hedefler.sort((a, b) => b.y - a.y); // Önce en aşağıdakiler
      let hedef = hedefler.find(h => !tumOklar.some(ok => ok.x === h.x && ok.y === h.y));
      if (!hedef && hedefler.length > 0) hedef = hedefler[0];
      if (hedef) {
        okHedefleri.push(hedef);
        tumOklar.push(hedef);

        const fromX = x * kare + 300 + kare / 2;
        const fromY = y * kare + kare / 2;
        const toX = hedef.x * kare + 300 + kare / 2;
        const toY = hedef.y * kare + kare / 2;

        ctx.lineWidth = 5;
        ctx.strokeStyle = "green";
        ctx.fillStyle = "green";

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        const angle = Math.atan2(toY - fromY, toX - fromX);
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - 15 * Math.cos(angle - Math.PI / 8), toY - 15 * Math.sin(angle - Math.PI / 8));
        ctx.lineTo(toX - 15 * Math.cos(angle + Math.PI / 8), toY - 15 * Math.sin(angle + Math.PI / 8));
        ctx.closePath();
        ctx.fill();
      } else {
        okHedefleri.push({ x: x, y: y });
      }
    }

    // --- S_AT ---
    else if (tas.tur === "s_at") {
      let x = tas.gridX;
      let y = tas.gridY;
      const atHareketleri = [
        { dx: -2, dy: 1 }, { dx: -1, dy: 2 }, { dx: 1, dy: 2 }, { dx: 2, dy: 1 },
        { dx: -2, dy: -1 }, { dx: -1, dy: -2 }, { dx: 1, dy: -2 }, { dx: 2, dy: -1 }
      ];
      // Sadece aşağıya giden L'ler
      let hedefler = atHareketleri
        .filter(mv => mv.dy > 0)
        .map(mv => ({ x: x + mv.dx, y: y + mv.dy }))
        .filter(h => h.x >= 0 && h.x < tahtaboyutu && h.y >= 0 && h.y < tahtaboyutu)
        .filter(h => !myGamePieces.some(t => t.gridX === h.x && t.gridY === h.y));
      // En aşağıya inenlerden biri
      hedefler.sort((a, b) => b.y - a.y);
      let hedef = hedefler.find(h => !tumOklar.some(ok => ok.x === h.x && ok.y === h.y));
      if (!hedef && hedefler.length > 0) hedef = hedefler[0];
      if (hedef) {
        sAtOkHedefleri.push(hedef);
        tumOklar.push(hedef);

        const fromX = x * kare + 300 + kare / 2;
        const fromY = y * kare + kare / 2;
        const toX = hedef.x * kare + 300 + kare / 2;
        const toY = hedef.y * kare + kare / 2;

        ctx.lineWidth = 5;
        ctx.strokeStyle = "orange";
        ctx.fillStyle = "orange";

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        const angle = Math.atan2(toY - fromY, toX - fromX);
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - 15 * Math.cos(angle - Math.PI / 8), toY - 15 * Math.sin(angle - Math.PI / 8));
        ctx.lineTo(toX - 15 * Math.cos(angle + Math.PI / 8), toY - 15 * Math.sin(angle + Math.PI / 8));
        ctx.closePath();
        ctx.fill();
      } else {
        sAtOkHedefleri.push({ x: x, y: y });
      }
    }
  }
}
// Düşman taşlarınının hareketi için kullanılan fonksiyon
  function hareket(){
   
    let sfilIndex = 0;
    let sAtIndex = 0;
    for (let i = 0; i < myGamePieces.length; i++) {
      if(myGamePieces[i].tur=="piyon" || myGamePieces[i].tur=="s_sah"){ 
        if (myGamePieces[i].gridY < tahtaboyutu - 1) { // tahtadan çıkmasın
          myGamePieces[i].gridY += 1;
        }
      }
      if(myGamePieces[i].tur=="sfil") {
        // Okciz'de kaydedilen hedefe git
        const hedef = okHedefleri[sfilIndex];
        if (hedef && (hedef.x !== myGamePieces[i].gridX || hedef.y !== myGamePieces[i].gridY)) {
          myGamePieces[i].gridX = hedef.x;
          myGamePieces[i].gridY = hedef.y;
        }
        sfilIndex++;
      }
      if(myGamePieces[i].tur=="s_at") {
        // Okciz'de kaydedilen hedefe git
        const hedef = sAtOkHedefleri[sAtIndex];
        if (hedef && (hedef.x !== myGamePieces[i].gridX || hedef.y !== myGamePieces[i].gridY)) {
          myGamePieces[i].gridX = hedef.x;
          myGamePieces[i].gridY = hedef.y;
        }
        sAtIndex++;
      }
    }
  }

// Şah taşının hareketini ve özel taş hareketleri için kullanılan fonksiyon  
  function sahHareket(clickedGridX,clickedGridY){
      let satir = bsah.gridX;
       let sutun = bsah.gridY;

      if (kaleSecildi) {
    // 4 yön: sağ, sol, aşağı, yukarı
    const directions = [
      {dx: 1, dy: 0},   // sağ
      {dx: -1, dy: 0},  // sol
      {dx: 0, dy: 1},   // aşağı
      {dx: 0, dy: -1}   // yukarı
    ];
    for (const dir of directions) {
      let x = satir + dir.dx;
      let y = sutun + dir.dy;
      while (x >= 0 && x < tahtaboyutu && y >= 0 && y < tahtaboyutu) {
        if (x === clickedGridX && y === clickedGridY) {
          bsah.gridX = clickedGridX;
          bsah.gridY = clickedGridY;
          bsah.x = bsah.gridX * kare + 300;
          bsah.y = bsah.gridY * kare;
          hareketSesi.play();
          tassil();
          hareket();
          myGamePieces = myGamePieces.filter(p => p.tur !== "kale");
          kaleSecildi = false;
          return;
        }
        if (myGamePieces.some(tas => tas.gridX === x && tas.gridY === y)) break;
        x += dir.dx;
        y += dir.dy;
      }
    }
  }
  else if (filSecildi) {
    // 4 çapraz yön: sağ üst, sol üst, sağ alt, sol alt
    const directions = [
      {dx: 1, dy: 1},
      {dx: 1, dy: -1},
      {dx: -1, dy: 1},
      {dx: -1, dy: -1}
    ];
    for (const dir of directions) {
      let x = satir + dir.dx;
      let y = sutun + dir.dy;
      while (x >= 0 && x < tahtaboyutu && y >= 0 && y < tahtaboyutu) {
        if (x === clickedGridX && y === clickedGridY) {
          bsah.gridX = clickedGridX;
          bsah.gridY = clickedGridY;
          bsah.x = bsah.gridX * kare + 300;
          bsah.y = bsah.gridY * kare;
          hareketSesi.play();
          tassil();
          hareket();
          myGamePieces = myGamePieces.filter(p => p.tur !== "fil");
          filSecildi = false;
          return;
        }
        if (myGamePieces.some(tas => tas.gridX === x && tas.gridY === y)) break;
        x += dir.dx;
        y += dir.dy;
      }
    }
  }

  else if(atSecildi) {
    // Satranç atı hareketleri (L şeklinde)
    const knightMoves = [
      {dx: -2, dy: 1}, {dx: -1, dy: 2}, {dx: 1, dy: 2}, {dx: 2, dy: 1},
      {dx: -2, dy: -1}, {dx: -1, dy: -2}, {dx: 1, dy: -2}, {dx: 2, dy: -1}
    ];
    for (const mv of knightMoves) {
      let x = satir + mv.dx;
      let y = sutun + mv.dy;
      if (x === clickedGridX && y === clickedGridY) {
        bsah.gridX = clickedGridX;
        bsah.gridY = clickedGridY;
        bsah.x = bsah.gridX * kare + 300;
        bsah.y = bsah.gridY * kare;
        hareketSesi.play();
        tassil();
        hareket();
        myGamePieces = myGamePieces.filter(p => p !== seciliAt);
      atSecildi = false;
      seciliAt = null;
        return;
      }
    }
  }

 else{ 
  if ((clickedGridX > satir - 2) && (clickedGridX < satir + 2) &&
      (clickedGridY > sutun - 2) && (clickedGridY < sutun + 2)) {
    if ((clickedGridX !== satir) || (clickedGridY !== sutun)) {
      bsah.gridX = clickedGridX;
      bsah.gridY = clickedGridY;
      bsah.x = bsah.gridX * kare + 300;
      bsah.y = bsah.gridY * kare;
      hareketSesi.play();

      tassil();
      hareket();
    }
  }
}};


    

  function tassil() {
  let sfilIndex = 0;
  let sAtIndex = 0;
  // 1. Silinecek taşların indekslerini topla
  let silinecekler = [];
  for (let i = 1; i < myGamePieces.length; i++) {
    let tas = myGamePieces[i];
    if (tas.tur === "piyon" || tas.tur === "s_sah") {
      if (
        (bsah.gridX === tas.gridX && bsah.gridY === tas.gridY) ||
        (bsah.gridX === tas.gridX && bsah.gridY === tas.gridY + 1)
      ) {
        silinecekler.push(i);
        yutmaSesi.play();
      }
    }
   if (tas.tur === "sfil") {
      const hedef = okHedefleri[sfilIndex];
      if (
        (bsah.gridX === tas.gridX && bsah.gridY === tas.gridY) || // Silinecek taşın koordinatları ile Şahın koordinatları aynıysa
        (hedef && bsah.gridX === hedef.x && bsah.gridY === hedef.y) // veya ok hedefi ile aynıysa
      ) {                                                               
        silinecekler.push(i);
        yutmaSesi.play();
      }
      sfilIndex++;
    }
    if (tas.tur === "s_at") {
      const hedef = sAtOkHedefleri[sAtIndex];
      if (
        (bsah.gridX === tas.gridX && bsah.gridY === tas.gridY) ||
        (hedef && bsah.gridX === hedef.x && bsah.gridY === hedef.y)
      ) {
        silinecekler.push(i);
        yutmaSesi.play();
      }
      sAtIndex++;
    }
  }
  // 2. Tüm silinecek taşları sondan başa sil
  silinecekler.sort((a, b) => b - a);
  for (let idx of silinecekler) {
    myGamePieces.splice(idx, 1);
  }
  levelkontrol();
}

// Sağdaki bilgi kutularını ve son level kutusunu çizer
// Bu Fonksiyon neredeyse tamamen ChatGPT tarafından yazılmıştır ama co-pilot kullandığım için linki atamıyorum maalesef
function bilgiKutulariniCiz() {
  // Satranç tahtasının sağında, içine girmeyecek şekilde konumlandır
  const x = 1000; // Tahtanın sağ dışı
  const genislik = 320; // Genişlik sabit
  const yukseklik = 220; // Yüksekliği artırdık (dikey uzun)

  // --- 1. Sabit mesaj kutusu (her levelde göster) ---
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.18)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 6;

  // Kutu arka planı (gradient)
  let gradient = ctx.createLinearGradient(x, 50, x + genislik, 50 + yukseklik);
  gradient.addColorStop(0, "#fffbe6");
  gradient.addColorStop(1, "#ffe9c7");
  ctx.fillStyle = gradient;

  // DÜZ DİKDÖRTGEN KUTU
  ctx.fillRect(x, 50, genislik, yukseklik);

  // Kenarlık
  ctx.shadowBlur = 0;
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#ff9800";
  ctx.strokeRect(x, 50, genislik, yukseklik);

  // Yazı (tam ortada)
  ctx.fillStyle = "#b36b00";
  ctx.font = "bold 26px 'Segoe UI', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(255,200,80,0.22)";
  ctx.shadowBlur = 6;
  ctx.fillText("Düşmanın sınıra ", x + genislik / 2, 50 + yukseklik / 2 - 30);
  ctx.fillText("ulaşmasına", x + genislik / 2, 50 + yukseklik / 2 );
  ctx.fillText("İZİN VERME!", x + genislik / 2, 50 + yukseklik / 2 + 30);
  ctx.restore();

  // --- 2. Seçim mesajı (ilk level hariç her levelde göster) ---
  if (count > 0) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.13)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    let yukseklik2 = 120;
    let y2 = 290; // Alt kutunun y'si, üst kutunun altına gelsin
    let gradient2 = ctx.createLinearGradient(x, y2, x + genislik, y2 + yukseklik2);
    gradient2.addColorStop(0, "#eaf6ff");
    gradient2.addColorStop(1, "#d0eaff");
    ctx.fillStyle = gradient2;

    // DÜZ DİKDÖRTGEN KUTU
    ctx.fillRect(x, y2, genislik, yukseklik2);

    ctx.shadowBlur = 0;
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#1976d2";
    ctx.strokeRect(x, y2, genislik, yukseklik2);

    ctx.fillStyle = "#0d3057";
    ctx.font = "bold 22px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(80,180,255,0.18)";
    ctx.shadowBlur = 6;
    ctx.fillText("Bir kere kullanabileceğin", x + genislik / 2, y2 + yukseklik2 / 2 - 16);
    ctx.fillText("bir özellik seç", x + genislik / 2, y2 + yukseklik2 / 2 + 16);
    ctx.restore();
  }

if (count === 6 && !oyunBitti) {
    const kutuX = 1000;
    const kutuY = 430;
    const kutuGenislik = 320;
    const kutuYukseklik = 100;

    ctx.save();
    ctx.shadowColor = "rgba(255,0,0,0.18)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6;

    // Kutu arka planı (kırmızımsı gradient)
    let gradient3 = ctx.createLinearGradient(kutuX, kutuY, kutuX + kutuGenislik, kutuY + kutuYukseklik);
    gradient3.addColorStop(0, "#ffeaea");
    gradient3.addColorStop(1, "#ffb3b3");
    ctx.fillStyle = gradient3;

    ctx.fillRect(kutuX, kutuY, kutuGenislik, kutuYukseklik);

    ctx.shadowBlur = 0;
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#e53935";
    ctx.strokeRect(kutuX, kutuY, kutuGenislik, kutuYukseklik);

    ctx.fillStyle = "#b71c1c";
    ctx.font = "bold 22px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(255,0,0,0.13)";
    ctx.shadowBlur = 6;
    ctx.fillText("Düşman Şahını da yen", kutuX + kutuGenislik / 2, kutuY + kutuYukseklik / 2 -15);
    ctx.fillText("ve oyunu bitir!", kutuX + kutuGenislik / 2, kutuY + kutuYukseklik / 2 + 15);
    ctx.restore();
  }

}

// Level geçişlerini ve oyunun bitişini kontrol eder
  function levelkontrol(){
  const oyuncuTaslari = ["sah", "at", "kale", "fil"];
  const kalanDusman = myGamePieces.filter(tas => !oyuncuTaslari.includes(tas.tur));
  

  if (kalanDusman.length === 0){
  if (count === 6) {
    // 6. seviyeden sonra oyun bitsin
    oyunBitti = true;
    return;
  }
  // Level geçişi için sayacı artır
  count += 1;
  yenilevel();
  return;
}
  for(let i=1; i<myGamePieces.length;i++){
    if(myGamePieces[i].gridY == 7){ // düşman taşları 7. satıra ulaştıysa level yeniden başlar
      levelRestart();
    }
  }

  }
//Yeni leveli başlatır ve taşları oluşturur
    function yenilevel(){
      myGamePieces = [];
      // Level geçişi için animasyonu başlat
   levelTransition.active = true;
  levelTransition.phase = 1;
  levelTransition.timer = 0;
  transitionX = 0;
  levelTransition.action = "new";

  // Yeni level için taşları oluştur
     if(count == 1){ 
      

      bsah = new component(kare, kare, 3, 7, "assets/w_kingg.png","sah");
      myGamePieces.push(bsah);

      for(let i=1; i<4; i++){
        let piyon = new component(kare, kare, i, i-2, "assets/b_pawn.png", "piyon");
        myGamePieces.push(piyon);
      }
      for(let i=4;i<7;i++){
        let piyon = new component(kare, kare, i, 5-i, "assets/b_pawn.png", "piyon");
        myGamePieces.push(piyon);
      }
     
      bfil=new component(kare,kare,-2,1,"assets/w_bishop.png","fil");
      myGamePieces.push(bfil);

      bkale=new component(kare,kare,-3,1,"assets/w_rook.png","kale");
      myGamePieces.push(bkale);
    }
    if(count == 2){
 
      bsah = new component(kare, kare, 3, 7, "assets/w_kingg.png","sah");
      myGamePieces.push(bsah);

      let piyon1 = new component(kare, kare, 2, -1, "assets/b_pawn.png", "piyon");
        myGamePieces.push(piyon1);
      let piyon2 = new component(kare, kare, 5, -1, "assets/b_pawn.png", "piyon");
        myGamePieces.push(piyon2);

        sfil1=new component(kare,kare, 4,0,"assets/b_bishop.png","sfil");
      myGamePieces.push(sfil1); 
      
     bfil=new component(kare,kare,-2,1,"assets/w_bishop.png","fil");
      myGamePieces.push(bfil);

    }

    if(count == 3){
      bsah = new component(kare, kare, 3, 7, "assets/w_kingg.png","sah");
      myGamePieces.push(bsah);

      for(let i=2; i<6; i+=3){
        let piyon = new component(kare, kare, i,-1, "assets/b_pawn.png", "piyon");
        myGamePieces.push(piyon);
      }
      for(let i=3;i<5;i++){
        let piyon = new component(kare, kare, i, 0, "assets/b_pawn.png", "piyon");
        myGamePieces.push(piyon);
      }
       
       s_at = new component(kare, kare, 4, 0, "assets/b_knight.png", "s_at");
        myGamePieces.push(s_at);
    
       b_at = new component(kare, kare, -2, 1, "assets/w_knight.png", "at");
        myGamePieces.push(b_at);
        
      b_at1 = new component(kare, kare, -3, 3, "assets/w_knight.png", "at");
        myGamePieces.push(b_at1);  
      
       bkale=new component(kare,kare,-3,1,"assets/w_rook.png","kale");
      myGamePieces.push(bkale);

    }
    
    if(count == 4){
      bsah = new component(kare, kare, 3, 0, "assets/w_kingg.png","sah");
      myGamePieces.push(bsah);

      let piyon = new component(kare,kare,1,-1,"assets/b_pawn.png","piyon");
        myGamePieces.push(piyon);

      let piyon1 = new component(kare,kare,2,1,"assets/b_pawn.png","piyon");
        myGamePieces.push(piyon1);  

      let piyon2 = new component(kare,kare,5,1,"assets/b_pawn.png","piyon");
        myGamePieces.push(piyon2); 

      let piyon3 = new component(kare,kare,6,2,"assets/b_pawn.png","piyon");
        myGamePieces.push(piyon3);
          
      let piyon4 = new component(kare,kare,6,-1,"assets/b_pawn.png","piyon");
        myGamePieces.push(piyon4);
        
      let piyon5 = new component(kare,kare,7,0,"assets/b_pawn.png","piyon");
        myGamePieces.push(piyon5);   

     b_at = new component(kare, kare, -2, 1, "assets/w_knight.png", "at");
        myGamePieces.push(b_at);
        
      b_at1 = new component(kare, kare, -3, 3, "assets/w_knight.png", "at");
        myGamePieces.push(b_at1);  
      
       bfil=new component(kare,kare,-3,1,"assets/w_bishop.png","fil");
        myGamePieces.push(bfil);

    }

    if(count == 5){
      bsah = new component(kare, kare, 2, 0, "assets/w_kingg.png","sah");
      myGamePieces.push(bsah);
    
      let s_At = new component(kare, kare, 2,1, "assets/b_knight.png", "s_at");
        myGamePieces.push(s_At);

      let piyon = new component(kare,kare,0,1,"assets/b_pawn.png","piyon");
        myGamePieces.push(piyon);

      let piyon1 = new component(kare,kare,7,2,"assets/b_pawn.png","piyon");
        myGamePieces.push(piyon1);  

       bfil=new component(kare,kare,-2,1,"assets/w_bishop.png","fil");
      myGamePieces.push(bfil);

       bkale=new component(kare,kare,-3,1,"assets/w_rook.png","kale");
      myGamePieces.push(bkale);

    }
    
    if(count == 6){

      bsah = new component(kare, kare, 4, 7, "assets/w_kingg.png","sah");
      myGamePieces.push(bsah);

     ssah= new component(kare, kare, 4, 0, "assets/b_king.png","s_sah");
      myGamePieces.push(ssah);
    }
    
  }

 // Taşların üstüne isim yazılarını yazar
  function yaziYaz(){

  for(let i=0; i<myGamePieces.length; i++){
    if(myGamePieces[i].tur === "fil"){
      ctx.fillStyle = "yellow";
      ctx.font = "24px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("fil", myGamePieces[i].x+43,  myGamePieces[i].y-10);
    }
   if(myGamePieces[i].tur === "kale"){
      ctx.fillStyle = "yellow";
      ctx.font = "24px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("kale", myGamePieces[i].x+43,  myGamePieces[i].y-10);
    }
   if(myGamePieces[i].tur === "at"){
      ctx.fillStyle = "yellow";
      ctx.font = "24px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("at", myGamePieces[i].x+43,  myGamePieces[i].y-15);
    }  
  }
}
// Leveli yeniden başlatır ve taşları sıfırlar
   function levelRestart(){
  // Tüm taş referanslarını sıfırla
  bsah = bfil = bkale = b_at = b_at1 = sfil1 = sfil2 = ssah = null;
  filSecildi = false;
  kaleSecildi = false;
  atSecildi = false;
  seciliAt = null;
  okHedefleri = [];
sAtOkHedefleri = [];
piyonOkHedefleri = [];
  myGamePieces = [];

  levelTransition.active = true;
  levelTransition.phase = 1;
  levelTransition.timer = 0;
  transitionX = 0;
  levelTransition.action = "restart";

  if(count == 0){
    bsah = new component(kare, kare, 3, 7, "assets/w_kingg.png","sah");
    myGamePieces.push(bsah);

    for (let i = 1; i < 5; i++) {
      let piyon = new component(kare, kare, i + 1, 4 - i, "assets/b_pawn.png","piyon");
      myGamePieces.push(piyon);
    }
  }
  if(count == 1){ 
    bsah = new component(kare, kare, 3, 7, "assets/w_kingg.png","sah");
    myGamePieces.push(bsah);

    for(let i=1; i<4; i++){
      let piyon = new component(kare, kare, i, i-1, "assets/b_pawn.png", "piyon");
      myGamePieces.push(piyon);
    }
    for(let i=4;i<7;i++){
      let piyon = new component(kare, kare, i, 6-i, "assets/b_pawn.png", "piyon");
      myGamePieces.push(piyon);
    }
    
    
    bfil = new component(kare, kare, -2, 1, "assets/w_bishop.png", "fil");
    myGamePieces.push(bfil);

    bkale = new component(kare, kare, -3, 1, "assets/w_rook.png", "kale");
    myGamePieces.push(bkale);
  }
  if(count == 2){
    bsah = new component(kare, kare, 3, 7, "assets/w_kingg.png","sah");
    myGamePieces.push(bsah);

    let piyon1 = new component(kare, kare, 2, 0, "assets/b_pawn.png", "piyon");
    myGamePieces.push(piyon1);
    let piyon2 = new component(kare, kare, 5, 0, "assets/b_pawn.png", "piyon");
    myGamePieces.push(piyon2);

    sfil2 = new component(kare, kare, 4, 0, "assets/b_bishop.png", "sfil");
    myGamePieces.push(sfil2);

    bfil = new component(kare, kare, -2, 1, "assets/w_bishop.png", "fil");
    myGamePieces.push(bfil);
    bkale = new component(kare, kare, -3, 1, "assets/w_rook.png", "kale");
    myGamePieces.push(bkale);
  }
  if(count == 3){
    bsah = new component(kare, kare, 3, 7, "assets/w_kingg.png","sah");
    myGamePieces.push(bsah);

    for(let i=2; i<6; i+=3){
      let piyon = new component(kare, kare, i,0, "assets/b_pawn.png", "piyon");
      myGamePieces.push(piyon);
    }
    for(let i=3;i<5;i++){
      let piyon = new component(kare, kare, i, 1, "assets/b_pawn.png", "piyon");
      myGamePieces.push(piyon);
    }
    
      let s_at = new component(kare, kare, 4, 0, "assets/b_knight.png", "s_at");
      myGamePieces.push(s_at);
    

    b_at = new component(kare, kare, -2, 1, "assets/w_knight.png", "at");
    myGamePieces.push(b_at);
    b_at1 = new component(kare, kare, -3, 3, "assets/w_knight.png", "at");
    myGamePieces.push(b_at1);

    bkale = new component(kare, kare, -3, 1, "assets/w_rook.png", "kale");
    myGamePieces.push(bkale);
  }
  if(count == 4){
    bsah = new component(kare, kare, 3, 0, "assets/w_kingg.png","sah");
    myGamePieces.push(bsah);

    let piyon = new component(kare,kare,1,0,"assets/b_pawn.png","piyon");
    myGamePieces.push(piyon);

    let piyon1 = new component(kare,kare,2,2,"assets/b_pawn.png","piyon");
    myGamePieces.push(piyon1);  

    let piyon2 = new component(kare,kare,5,2,"assets/b_pawn.png","piyon");
    myGamePieces.push(piyon2); 

    let piyon3 = new component(kare,kare,6,3,"assets/b_pawn.png","piyon");
    myGamePieces.push(piyon3);
      
    let piyon4 = new component(kare,kare,6,0,"assets/b_pawn.png","piyon");
    myGamePieces.push(piyon4);
    
    let piyon5 = new component(kare,kare,7,1,"assets/b_pawn.png","piyon");
    myGamePieces.push(piyon5);   

    b_at = new component(kare, kare, -2, 1, "assets/w_knight.png", "at");
    myGamePieces.push(b_at);
    b_at1 = new component(kare, kare, -3, 3, "assets/w_knight.png", "at");
    myGamePieces.push(b_at1);

    bfil= new component(kare, kare, -3, 1, "assets/w_bishop.png", "fil");
    myGamePieces.push(bfil);
  }
  if(count == 5){
    bsah = new component(kare, kare, 2, 0, "assets/w_kingg.png","sah");
    myGamePieces.push(bsah);

    let s_At = new component(kare, kare, 2,1, "assets/b_knight.png", "s_at");
        myGamePieces.push(s_At);


    let piyon = new component(kare,kare,0,2,"assets/b_pawn.png","piyon");
    myGamePieces.push(piyon);

    let piyon1 = new component(kare,kare,7,3,"assets/b_pawn.png","piyon");
    myGamePieces.push(piyon1);  

    bfil = new component(kare, kare, -2, 1, "assets/w_bishop.png", "fil");
    myGamePieces.push(bfil);

    bkale = new component(kare, kare, -3, 1, "assets/w_rook.png", "kale");
    myGamePieces.push(bkale);
  }
  if(count == 6){
    bsah = new component(kare, kare, 4, 7, "assets/w_kingg.png","sah");
    myGamePieces.push(bsah);

    ssah = new component(kare, kare, 4, 0, "assets/b_king.png","s_sah");
    myGamePieces.push(ssah);
  }
}
  
//// Oyun ekranını ve animasyonları günceller
   function updateGameArea() {
    if (oyunBitti) {
  ctx.save();
  ctx.fillStyle = "yellow";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "red";
  ctx.font = "bold 54px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🎉 Kazandın, tebrikler! 🎉", canvas.width / 2, canvas.height / 2);
  ctx.restore();
  return;
}

    // Ekranı temizle ve arka planı çiz
  myGameArea.clear();
 ctx.drawImage(arkaplanImg, 0, 0, canvas.width, canvas.height);
 
   // fonksiyonları çağır
  tahtaCiz();
  kareboya();
  okciz();
  for (let i = 0; i < myGamePieces.length; i++) {
    myGamePieces[i].update();
  }
  yaziYaz();

  // Animasyon yönetimi
 if (levelTransition.active) {
  ctx.save();
  ctx.fillStyle = "black";
  ctx.globalAlpha = 1.0;

  if (levelTransition.phase === 1) {
    // Ekranı tamamen kapat
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    levelTransition.timer++;

    if (levelTransition.timer >= levelTransition.delay) {
      levelTransition.phase = 2;
      levelTransition.timer = 0;

      // Yeni level veya restart burada yüklensin
      if (levelTransition.action === "new") {
        asd();
      } else if (levelTransition.action === "restart") {
        asd(); // varsa ya da direkt yeniden başlat
      }
    }
  } else if (levelTransition.phase === 2) {
    // Sağdan açılan animasyon
    ctx.fillRect(0, 0, canvas.width - transitionX, canvas.height);
    transitionX += 40;
    if (transitionX >= canvas.width) {
      levelTransition.active = false;
      levelTransition.phase = 0;
    }
  }

  ctx.restore();
  return;
}

levelkontrol();
bilgiKutulariniCiz();
}
   
// Oyun başlatma fonksiyonu
    function startGame(){
      myGamePieces[0] = new component(kare, kare, 3, 7, "assets/w_kingg.png","sah");
      bsah=myGamePieces[0];
      for(let i=1; i<5;i++){
        myGamePieces[i]= new component(kare,kare,i+1,4-i,"assets/b_pawn.png","piyon");
      }
      myGameArea.start();
    }

// Canvas'a tıklama olayını kontrol eder
   canvas.addEventListener("click", function(event){
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left; // Canvas'ın sol kenarına göre X koordinatı
  const mouseY = event.clientY - rect.top; // Canvas'ın üst kenarına göre Y koordinatı


  // 1. Önce TAŞLARIN ÜZERİNE TIKLANDI MI kontrol et
  for (let i = 0; i < myGamePieces.length; i++) {
    const tas = myGamePieces[i];
    const tasX = tas.x;
    const tasY = tas.y;
    

   if (mouseX >= tasX && mouseX <= tasX + tas.width && 
    mouseY >= tasY && mouseY <= tasY + tas.height) { // doğru tıklama kontrolü
  if (tas.tur === "fil") {
    // Toggle mantığı
    if (filSecildi) {
      filSecildi = false;
      kaleSecildi = false;
      atSecildi=false;
    } else {
      filSecildi = true;
      kaleSecildi = false;
      atSecildi=false;
    }
  } else if (tas.tur === "kale") {
    if (kaleSecildi) {
      kaleSecildi = false;
      filSecildi = false;
      atSecildi=false;
    } else {
      kaleSecildi = true;
      filSecildi = false;
      atSecildi=false;
    }
  }
 else if (tas.tur === "at") {
  if (atSecildi && seciliAt === tas) {
    atSecildi = false;
    filSecildi = false;
    kaleSecildi = false;
    seciliAt = null;
  } else {
    atSecildi = true;
    filSecildi = false;
    kaleSecildi = false;
    seciliAt = tas;
  }
}
  }
}
  

  // 2. Eğer taşa değilse — TAHTA üzerindeki hamle olabilir
  let clickedGridX = Math.floor((mouseX - 300) / kare);
  let clickedGridY = Math.floor(mouseY / kare);

  if (clickedGridX < 0 || clickedGridX >= tahtaboyutu || clickedGridY < 0 || clickedGridY >= tahtaboyutu) {
    return; // Bu noktada sadece tahta içi hamle engellenir
  }

sahHareket(clickedGridX,clickedGridY);


  // Şah hareket kontrolü
   });

// Oyun müziğini yükler ve ilk tıklamada başlatır
    let ses;
window.onload = function() {
  ses = new Audio("assets/cendere.mp3");
  ses.loop = true;
  ses.volume = 0.1;


  // İlk kullanıcı tıklamasında müziği başlatır
  document.addEventListener("click", function playOnce() {
    ses.play();
    document.removeEventListener("click", playOnce);
  });
}



<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Sellos - El Patrón del Mal</title>

  <style>
    :root{
      --bg:#020202;
      --bg2:#020617;
      --panel:#0b1220;
      --panel2:#111827;
      --gold:#facc15;
      --gold2:#ff9f1c;
      --gold-soft:#fde68a;
      --text:#f8fafc;
      --muted:#94a3b8;
      --muted2:#cbd5e1;
      --line:#334155;
      --ok:#16a34a;
      --bad:#dc2626;
      --green:#22c55e;
      --orange:#fb923c;
      --blue:#38bdf8;
      --red:#ef4444;
    }

    *{ box-sizing:border-box; }

    body{
      margin:0;
      min-height:100vh;
      font-family:Arial, Helvetica, sans-serif;
      color:var(--text);
      background:
        radial-gradient(circle at top, rgba(250,204,21,.15), transparent 30%),
        radial-gradient(circle at bottom left, rgba(255,159,28,.10), transparent 28%),
        linear-gradient(180deg, #000 0%, var(--bg2) 100%);
      padding:20px;
      position:relative;
      overflow-x:hidden;
    }

    body::before{
      content:"";
      position:fixed;
      inset:0;
      background:
        linear-gradient(45deg, rgba(255,255,255,.025) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(255,255,255,.025) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, rgba(255,255,255,.025) 75%),
        linear-gradient(-45deg, transparent 75%, rgba(255,255,255,.025) 75%);
      background-size:30px 30px;
      background-position:0 0,0 15px,15px -15px,-15px 0;
      opacity:.52;
      pointer-events:none;
      z-index:0;
    }

    .wrap{
      width:100%;
      max-width:1060px;
      margin:0 auto;
      position:relative;
      z-index:1;
    }

    .shell{
      background:
        radial-gradient(circle at top right, rgba(250,204,21,.10), transparent 30%),
        linear-gradient(180deg, rgba(17,24,39,.96), rgba(2,6,23,.96));
      border:1px solid rgba(250,204,21,.30);
      border-radius:30px;
      padding:22px;
      box-shadow:
        0 22px 55px rgba(0,0,0,.55),
        0 0 30px rgba(250,204,21,.08),
        inset 0 0 0 1px rgba(255,255,255,.035);
      overflow:hidden;
      position:relative;
    }

    .shell::before{
      content:"";
      position:absolute;
      right:-120px;
      top:-130px;
      width:300px;
      height:300px;
      border-radius:50%;
      background:radial-gradient(circle, rgba(250,204,21,.18), transparent 70%);
      pointer-events:none;
    }

    .top{
      position:relative;
      z-index:1;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:18px;
      margin-bottom:18px;
      flex-wrap:wrap;
      padding-bottom:16px;
      border-bottom:1px solid rgba(250,204,21,.18);
    }

    .top-left{
      display:flex;
      align-items:center;
      gap:16px;
      min-width:0;
    }

    .logo-stage{
      width:88px;
      height:88px;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      background:radial-gradient(circle, rgba(250,204,21,.18), transparent 72%);
      box-shadow:0 0 24px rgba(250,204,21,.12);
      flex-shrink:0;
    }

    .logo{
      width:72px;
      height:72px;
      border-radius:50%;
      object-fit:cover;
      border:2px solid rgba(255,255,255,.92);
      background:#000;
      box-shadow:0 0 17px rgba(250,204,21,.26);
    }

    .title{
      margin:0;
      font-size:clamp(28px, 4vw, 42px);
      line-height:1;
      color:var(--gold);
      font-weight:900;
      text-transform:uppercase;
      letter-spacing:.8px;
      text-shadow:0 0 10px rgba(250,204,21,.34), 0 0 18px rgba(255,159,28,.16);
    }

    .subtitle{
      margin:8px 0 0;
      color:#dbeafe;
      font-size:14px;
      line-height:1.4;
    }

    .badge{
      display:inline-flex;
      align-items:center;
      gap:8px;
      margin-top:8px;
      padding:7px 11px;
      border-radius:999px;
      border:1px solid rgba(34,197,94,.32);
      background:rgba(34,197,94,.10);
      color:#bbf7d0;
      font-size:12px;
      font-weight:900;
    }

    button{
      padding:14px 18px;
      border:none;
      border-radius:16px;
      font-size:15px;
      font-weight:900;
      cursor:pointer;
      transition:transform .12s ease, box-shadow .12s ease, opacity .12s ease;
    }

    button:hover{
      transform:translateY(-1px);
      box-shadow:0 10px 20px rgba(0,0,0,.28);
    }

    button:disabled{
      opacity:.72;
      cursor:not-allowed;
      transform:none;
      box-shadow:none;
    }

    .btn-primary{
      background:linear-gradient(180deg, #fde047, #facc15);
      color:#111827;
    }

    .btn-secondary{
      background:#0f172a;
      color:#f8fafc;
      border:1px solid #334155;
    }

    .btn-green{
      background:linear-gradient(180deg, #4ade80, #22c55e);
      color:#052e16;
    }

    .btn-red{
      background:linear-gradient(180deg, #f87171, #ef4444);
      color:#fff;
    }

    .btn-orange{
      background:linear-gradient(180deg, #fdba74, #fb923c);
      color:#3f1d00;
    }

    .btn-blue{
      background:linear-gradient(180deg, #7dd3fc, #38bdf8);
      color:#082f49;
    }


    .vip-dashboard{
      position:relative;
      z-index:1;
      display:grid;
      grid-template-columns:repeat(3,1fr);
      gap:12px;
      margin:0 0 16px;
    }

    .dash-card{
      background:
        radial-gradient(circle at top right, rgba(250,204,21,.13), transparent 35%),
        linear-gradient(180deg, rgba(0,0,0,.30), rgba(15,23,42,.74));
      border:1px solid rgba(250,204,21,.22);
      border-radius:22px;
      padding:15px;
      min-height:104px;
      box-shadow:inset 0 0 0 1px rgba(255,255,255,.025);
    }

    .dash-icon{
      width:38px;
      height:38px;
      display:flex;
      align-items:center;
      justify-content:center;
      border-radius:14px;
      background:rgba(250,204,21,.12);
      border:1px solid rgba(250,204,21,.22);
      font-size:20px;
      margin-bottom:10px;
    }

    .dash-label{
      color:#cbd5e1;
      font-size:12px;
      font-weight:900;
      text-transform:uppercase;
      letter-spacing:.35px;
    }

    .dash-value{
      margin-top:5px;
      color:var(--gold);
      font-size:31px;
      line-height:1;
      font-weight:900;
      text-shadow:0 0 12px rgba(250,204,21,.18);
    }

    .ranking-panel{
      position:relative;
      z-index:1;
      background:rgba(0,0,0,.24);
      border:1px solid rgba(250,204,21,.20);
      border-radius:24px;
      padding:16px;
      margin-bottom:16px;
      display:none;
    }

    .ranking-panel.show{
      display:block;
    }

    .ranking-head{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      flex-wrap:wrap;
      margin-bottom:12px;
    }

    .ranking-head h2{
      margin:0;
      color:var(--gold-soft);
      font-size:20px;
      line-height:1;
    }

    .ranking-list{
      display:grid;
      gap:9px;
      max-height:430px;
      overflow:auto;
      padding-right:4px;
    }

    .ranking-item{
      display:grid;
      grid-template-columns:54px 1fr auto;
      gap:10px;
      align-items:center;
      padding:12px;
      border-radius:18px;
      border:1px solid rgba(148,163,184,.18);
      background:linear-gradient(180deg, rgba(2,6,23,.96), rgba(15,23,42,.86));
    }

    .ranking-pos{
      width:44px;
      height:44px;
      display:flex;
      align-items:center;
      justify-content:center;
      border-radius:16px;
      background:rgba(250,204,21,.12);
      border:1px solid rgba(250,204,21,.24);
      color:var(--gold);
      font-weight:900;
      font-size:15px;
    }

    .ranking-name{
      color:#fff;
      font-weight:900;
      font-size:15px;
      line-height:1.2;
      word-break:break-word;
    }

    .ranking-phone{
      margin-top:4px;
      color:#94a3b8;
      font-size:12px;
      font-weight:800;
    }

    .ranking-stamps{
      text-align:right;
      color:var(--gold);
      font-weight:900;
      white-space:nowrap;
    }

    .ranking-stamps small{
      display:block;
      color:#cbd5e1;
      font-size:11px;
      margin-top:3px;
    }


    .ranking-delete{
      margin-top:8px;
      padding:7px 10px;
      border-radius:12px;
      font-size:12px;
      background:linear-gradient(180deg, #f87171, #ef4444);
      color:#fff;
      width:auto;
    }

    .ranking-pending{
      display:inline-flex;
      margin-top:5px;
      padding:4px 8px;
      border-radius:999px;
      background:rgba(251,146,60,.12);
      border:1px solid rgba(251,146,60,.28);
      color:#fed7aa;
      font-size:11px;
      font-weight:900;
    }


    .search-panel{
      position:relative;
      z-index:1;
      background:rgba(0,0,0,.24);
      border:1px solid rgba(250,204,21,.20);
      border-radius:24px;
      padding:16px;
      margin-bottom:16px;
    }

    .search-title{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      margin-bottom:12px;
      flex-wrap:wrap;
    }

    .search-title h2{
      margin:0;
      color:var(--gold-soft);
      font-size:20px;
      line-height:1;
    }

    .search-title span{
      color:#cbd5e1;
      font-size:13px;
      font-weight:800;
    }

    .search-box{
      display:grid;
      grid-template-columns:1fr auto;
      gap:10px;
    }

    input{
      width:100%;
      box-sizing:border-box;
      padding:14px 15px;
      border-radius:15px;
      border:1px solid #334155;
      background:#020617;
      color:#fff;
      font-size:16px;
      outline:none;
      transition:border-color .15s ease, box-shadow .15s ease, transform .15s ease;
    }

    input::placeholder{ color:#64748b; }

    input:focus{
      border-color:var(--gold);
      box-shadow:0 0 0 3px rgba(250,204,21,.12);
      transform:translateY(-1px);
    }

    .msg{
      margin-top:14px;
      padding:12px 13px;
      border-radius:14px;
      display:none;
      font-size:14px;
      line-height:1.45;
      word-break:break-word;
    }

    .ok{
      background:#052e16;
      color:#bbf7d0;
      border:1px solid var(--ok);
    }

    .err{
      background:#450a0a;
      color:#fecaca;
      border:1px solid var(--bad);
    }

    .result{
      position:relative;
      z-index:1;
      margin-top:16px;
      display:none;
    }

    .client-layout{
      display:grid;
      grid-template-columns:1.1fr .9fr;
      gap:16px;
      align-items:start;
    }

    .client-card,
    .reward-box,
    .history-card{
      background:
        linear-gradient(180deg, rgba(0,0,0,.28), rgba(15,23,42,.72));
      border:1px solid #1e293b;
      border-radius:24px;
      padding:16px;
      box-shadow:inset 0 0 0 1px rgba(255,255,255,.025);
    }

    .client-card{
      border-color:rgba(250,204,21,.24);
    }

    .client-head{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      margin-bottom:14px;
      padding-bottom:12px;
      border-bottom:1px solid rgba(250,204,21,.16);
    }

    .client-head h2{
      margin:0;
      color:var(--gold);
      font-size:22px;
      line-height:1;
    }

    .client-status{
      padding:7px 10px;
      border-radius:999px;
      background:rgba(250,204,21,.12);
      border:1px solid rgba(250,204,21,.28);
      color:var(--gold-soft);
      font-size:12px;
      font-weight:900;
      white-space:nowrap;
    }

    .info{
      display:grid;
      grid-template-columns:repeat(2,1fr);
      gap:10px;
    }

    .info-card{
      background:rgba(0,0,0,.26);
      border:1px solid rgba(148,163,184,.22);
      border-radius:18px;
      padding:14px;
    }

    .info-label{
      color:var(--muted);
      font-size:11px;
      margin-bottom:7px;
      font-weight:900;
      text-transform:uppercase;
      letter-spacing:.4px;
    }

    .info-value{
      color:#fff;
      font-size:18px;
      font-weight:900;
      word-break:break-word;
    }

    .info-value.gold{
      color:var(--gold);
      font-size:24px;
      text-shadow:0 0 9px rgba(250,204,21,.16);
    }

    .progress-area{
      margin-top:14px;
    }

    .progress-row{
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:10px;
      color:#cbd5e1;
      font-size:13px;
      font-weight:800;
      margin-bottom:8px;
    }

    .bar{
      width:100%;
      height:13px;
      background:#020617;
      border:1px solid #1e293b;
      border-radius:999px;
      overflow:hidden;
    }

    .bar-fill{
      height:100%;
      width:0%;
      background:linear-gradient(90deg, #facc15, #fff2a6);
      border-radius:999px;
      transition:width .35s ease;
      box-shadow:0 0 12px rgba(250,204,21,.42);
    }

    .actions{
      margin-top:16px;
      display:grid;
      grid-template-columns:repeat(2,1fr);
      gap:10px;
    }

    .actions button{
      width:100%;
    }

    .reward-box{
      margin-bottom:16px;
      border-color:rgba(250,204,21,.24);
    }

    .box-title{
      display:flex;
      align-items:center;
      gap:8px;
      margin:0 0 12px;
      color:var(--gold-soft);
      font-size:18px;
      font-weight:900;
    }

    .reward-note{
      margin-top:10px;
      color:#cbd5e1;
      font-size:13px;
      line-height:1.45;
    }

    .stamp-note{
      margin-top:12px;
      color:#fef3c7;
      font-size:14px;
      line-height:1.45;
      padding:12px;
      border-radius:16px;
      background:rgba(250,204,21,.08);
      border:1px solid rgba(250,204,21,.16);
    }

    .history-card{
      border-color:rgba(148,163,184,.22);
    }

    .history-list{
      max-height:320px;
      overflow:auto;
      padding-right:4px;
    }

    .history-item{
      padding:12px;
      border:1px solid rgba(148,163,184,.16);
      background:rgba(0,0,0,.20);
      border-radius:16px;
      margin-bottom:10px;
    }

    .history-item:last-child{
      margin-bottom:0;
    }

    .history-item div{
      font-size:13px;
      color:#dbeafe;
      line-height:1.45;
    }

    .history-item b{
      color:var(--gold-soft);
    }

    .mini{
      margin-top:16px;
      text-align:center;
      color:#94a3b8;
      font-size:13px;
      line-height:1.45;
    }

    .lock-screen{
      max-width:460px;
      min-height:calc(100vh - 40px);
      display:flex;
      align-items:center;
      justify-content:center;
    }

    .lock-card{
      width:100%;
      text-align:center;
      background:
        radial-gradient(circle at top, rgba(250,204,21,.13), transparent 34%),
        linear-gradient(180deg, rgba(17,24,39,.96), rgba(2,6,23,.96));
      border:1px solid rgba(250,204,21,.34);
      border-radius:30px;
      padding:28px 22px;
      box-shadow:
        0 22px 55px rgba(0,0,0,.55),
        0 0 28px rgba(250,204,21,.10),
        inset 0 0 0 1px rgba(255,255,255,.035);
    }

    .lock-logo-stage{
      width:122px;
      height:122px;
      margin:0 auto 14px;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      background:radial-gradient(circle, rgba(250,204,21,.18), transparent 72%);
      box-shadow:0 0 28px rgba(250,204,21,.12);
    }

    .lock-logo{
      width:100px;
      height:100px;
      border-radius:50%;
      object-fit:cover;
      border:2px solid rgba(255,255,255,.92);
      background:#000;
      box-shadow:0 0 18px rgba(250,204,21,.26);
    }

    .lock-title{
      margin:0 0 8px;
      font-size:31px;
      line-height:1;
      color:var(--gold);
      font-weight:900;
      text-transform:uppercase;
      text-shadow:0 0 10px rgba(250,204,21,.34);
    }

    .lock-subtitle{
      margin:0 0 18px;
      color:#dbeafe;
      font-size:14px;
      line-height:1.45;
    }

    .hidden{ display:none !important; }

    @media (max-width:900px){
      .client-layout{
        grid-template-columns:1fr;
      }
    }

    @media (max-width:700px){
      body{ padding:12px; }
      .shell{ padding:16px; border-radius:24px; }
      .top{
        align-items:flex-start;
      }
      .top-left{
        align-items:center;
      }
      .logo-stage{
        width:74px;
        height:74px;
      }
      .logo{
        width:60px;
        height:60px;
      }
      .title{ font-size:25px; }
      .subtitle{ font-size:13px; }
      .vip-dashboard{
        grid-template-columns:1fr;
      }
      .ranking-item{
        grid-template-columns:44px 1fr;
      }
      .ranking-stamps{
        grid-column:1 / -1;
        text-align:left;
        padding-left:54px;
      }
      .search-box{
        grid-template-columns:1fr;
      }
      .search-box button{
        width:100%;
      }
      .info{
        grid-template-columns:1fr;
      }
      .actions{
        grid-template-columns:1fr;
      }
      .top > button{
        width:100%;
      }
      .client-head{
        flex-direction:column;
        align-items:flex-start;
      }
      .lock-screen{
        min-height:calc(100vh - 24px);
      }
    }
  </style>
</head>

<body>
  <div id="lockScreen" class="wrap lock-screen">
    <div class="lock-card">
      <div class="lock-logo-stage">
        <img src="LOGO.jpg" alt="Logo" class="lock-logo">
      </div>

      <h1 class="lock-title">Acceso Admin</h1>
      <p class="lock-subtitle">Ingresa la clave para abrir el panel profesional de sellos y premios.</p>

      <input
        id="adminPassword"
        type="password"
        placeholder="Ingresa la clave"
        autocomplete="current-password"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false"
      >

      <button class="btn-primary" id="btnUnlock" style="width:100%; margin-top:14px;">Entrar al panel</button>

      <div id="lockMsgOk" class="msg ok"></div>
      <div id="lockMsgErr" class="msg err"></div>
    </div>
  </div>

  <div id="adminPanel" class="wrap hidden">
    <div class="shell">
      <div class="top">
        <div class="top-left">
          <div class="logo-stage">
            <img src="LOGO.jpg" alt="Logo" class="logo">
          </div>
          <div>
            <h1 class="title">Admin de Sellos</h1>
            <p class="subtitle">Busca clientes por celular, suma sellos y registra premios entregados.</p>
            <div class="badge">🟢 Panel activo · El Patrón del Mal</div>
          </div>
        </div>

        <button class="btn-red" id="btnLogout">Salir</button>
      </div>


      <div class="vip-dashboard">
        <div class="dash-card">
          <div class="dash-icon">👥</div>
          <div class="dash-label">Clientes registrados</div>
          <div class="dash-value" id="dashTotalClientes">--</div>
        </div>

        <div class="dash-card">
          <div class="dash-icon">⭐</div>
          <div class="dash-label">Sellos acumulados</div>
          <div class="dash-value" id="dashTotalSellos">--</div>
        </div>

        <div class="dash-card">
          <div class="dash-icon">🎁</div>
          <div class="dash-label">Premios pendientes</div>
          <div class="dash-value" id="dashPremiosPendientes">--</div>
        </div>
      </div>

      <div class="ranking-panel" id="rankingPanel">
        <div class="ranking-head">
          <h2>🏆 Ranking de clientes VIP</h2>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn-blue" id="btnReloadSummary" type="button">Actualizar ranking</button>
            <button class="btn-secondary" id="btnHideRanking" type="button">Ocultar</button>
          </div>
        </div>
        <div id="rankingList" class="ranking-list">
          Cargando ranking...
        </div>
      </div>

      <div style="position:relative;z-index:1;margin-bottom:16px;display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn-primary" id="btnShowRanking" type="button">🏆 Ver ranking de sellos</button>
        <button class="btn-secondary" id="btnRefreshSummary" type="button">📊 Actualizar resumen VIP</button>
      </div>

      <div class="search-panel">
        <div class="search-title">
          <h2>🔎 Buscar cliente</h2>
          <span>Ingresa el celular registrado en la tarjeta virtual</span>
        </div>

        <div class="search-box">
          <input
            id="buscarCelular"
            type="text"
            placeholder="Ej: 944275861"
            inputmode="numeric"
            autocomplete="off"
            autocapitalize="off"
            autocorrect="off"
            spellcheck="false"
          >
          <button class="btn-primary" id="btnBuscar">Buscar cliente</button>
        </div>

        <div id="msgOk" class="msg ok"></div>
        <div id="msgErr" class="msg err"></div>
      </div>

      <div id="result" class="result">
        <div class="client-layout">
          <section class="client-card">
            <div class="client-head">
              <h2>👤 Datos del cliente</h2>
              <div class="client-status" id="clienteEstado">Cliente cargado</div>
            </div>

            <div class="info">
              <div class="info-card">
                <div class="info-label">Cliente</div>
                <div class="info-value" id="clienteNombre">-</div>
              </div>

              <div class="info-card">
                <div class="info-label">Celular</div>
                <div class="info-value" id="clienteCelular">-</div>
              </div>

              <div class="info-card">
                <div class="info-label">Sellos actuales</div>
                <div class="info-value gold" id="clienteSellos">0 / 20</div>
              </div>

              <div class="info-card">
                <div class="info-label">Premio pendiente</div>
                <div class="info-value" id="clientePremio">No</div>
              </div>
            </div>

            <div class="progress-area">
              <div class="progress-row">
                <span>Progreso de tarjeta</span>
                <span id="progressText">0%</span>
              </div>
              <div class="bar">
                <div class="bar-fill" id="barFill"></div>
              </div>
            </div>

            <div class="actions">
              <button class="btn-green" id="btnAddStamp">+1 sello</button>
              <button class="btn-orange" id="btnClaimReward">Entregar premio</button>
              <button class="btn-blue" id="btnRefresh">Actualizar</button>
              <button class="btn-red" id="btnClear">Limpiar</button>
              <button class="btn-red" id="btnDeleteCustomer" type="button" style="grid-column:1 / -1;">🗑️ Eliminar cuenta del cliente</button>
            </div>

            <div class="stamp-note" id="stampNote">
              Busca un cliente para comenzar.
            </div>
          </section>

          <aside>
            <section class="reward-box">
              <div class="box-title">🎁 Premio entregado</div>
              <input
                id="rewardNote"
                type="text"
                placeholder="Ej: premio 5 sellos - 1LT DE BEBIDA"
                autocomplete="off"
                autocapitalize="off"
                autocorrect="off"
                spellcheck="false"
              >
              <div class="reward-note">
                Escribe qué premio entregaste antes de presionar <b>Entregar premio</b>.
              </div>
            </section>

            <section class="history-card">
              <div class="box-title">📋 Historial reciente</div>
              <div id="historyBox" class="reward-note history-list">
                Aquí aparecerán los últimos movimientos del cliente.
              </div>
            </section>
          </aside>
        </div>
      </div>

      <div class="mini">
        Panel para administrador o moza: suma sellos, entrega premios y revisa movimientos del cliente.
      </div>
    </div>
  </div>

  <script>
    const ADMIN_PASSWORD = "Bela1997";
    const ADMIN_SESSION_KEY = "pdm_admin_sellos_ok";

    const lockScreen = document.getElementById("lockScreen");
    const adminPanel = document.getElementById("adminPanel");
    const adminPassword = document.getElementById("adminPassword");
    const btnUnlock = document.getElementById("btnUnlock");
    const btnLogout = document.getElementById("btnLogout");
    const lockMsgOk = document.getElementById("lockMsgOk");
    const lockMsgErr = document.getElementById("lockMsgErr");

    const buscarCelular = document.getElementById("buscarCelular");
    const btnBuscar = document.getElementById("btnBuscar");
    const btnAddStamp = document.getElementById("btnAddStamp");
    const btnClaimReward = document.getElementById("btnClaimReward");
    const btnRefresh = document.getElementById("btnRefresh");
    const btnClear = document.getElementById("btnClear");
    const btnDeleteCustomer = document.getElementById("btnDeleteCustomer");
    const rewardNote = document.getElementById("rewardNote");

    const msgOk = document.getElementById("msgOk");
    const msgErr = document.getElementById("msgErr");

    const result = document.getElementById("result");
    const clienteNombre = document.getElementById("clienteNombre");
    const clienteCelular = document.getElementById("clienteCelular");
    const clienteSellos = document.getElementById("clienteSellos");
    const clientePremio = document.getElementById("clientePremio");
    const clienteEstado = document.getElementById("clienteEstado");
    const stampNote = document.getElementById("stampNote");
    const historyBox = document.getElementById("historyBox");
    const barFill = document.getElementById("barFill");
    const progressText = document.getElementById("progressText");

    const dashTotalClientes = document.getElementById("dashTotalClientes");
    const dashTotalSellos = document.getElementById("dashTotalSellos");
    const dashPremiosPendientes = document.getElementById("dashPremiosPendientes");
    const btnShowRanking = document.getElementById("btnShowRanking");
    const btnHideRanking = document.getElementById("btnHideRanking");
    const btnRefreshSummary = document.getElementById("btnRefreshSummary");
    const btnReloadSummary = document.getElementById("btnReloadSummary");
    const rankingPanel = document.getElementById("rankingPanel");
    const rankingList = document.getElementById("rankingList");

    let currentCustomer = null;
    let currentCard = null;


    function escapeHtml(value) {
      return String(value ?? "").replace(/[&<>'"]/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
      }[char]));
    }

    function renderRanking(ranking) {
      if (!Array.isArray(ranking) || ranking.length === 0) {
        rankingList.innerHTML = '<div class="reward-note">Todavía no hay clientes registrados para mostrar.</div>';
        return;
      }

      rankingList.innerHTML = ranking.map((item) => {
        const puesto = Number(item.puesto || 0);
        const medalla = puesto === 1 ? "🥇" : puesto === 2 ? "🥈" : puesto === 3 ? "🥉" : "#" + puesto;
        const nombre = escapeHtml(item.nombre || "Cliente sin nombre");
        const celular = escapeHtml(item.celular || "-");
        const sellos = Number(item.sellos_actuales || 0);
        const meta = Number(item.meta_sellos || 20) || 20;
        const pendiente = item.premio_pendiente ? '<span class="ranking-pending">🎁 premio pendiente</span>' : '';

        return `
          <div class="ranking-item">
            <div class="ranking-pos">${medalla}</div>
            <div>
              <div class="ranking-name">${nombre}</div>
              <div class="ranking-phone">📱 ${celular}</div>
              ${pendiente}
              <button class="ranking-delete" type="button" data-delete-phone="${celular}">🗑️ Eliminar</button>
            </div>
            <div class="ranking-stamps">
              ${sellos} / ${meta}
              <small>sellos</small>
            </div>
          </div>
        `;
      }).join("");
    }

    async function loadCustomersSummary(showRankingAfterLoad = false) {
      try {
        if (dashTotalClientes) dashTotalClientes.textContent = "...";
        if (dashTotalSellos) dashTotalSellos.textContent = "...";
        if (dashPremiosPendientes) dashPremiosPendientes.textContent = "...";

        const res = await fetch("/api/admin-customers-summary");
        const data = await res.json();

        if (!res.ok || !data.ok) {
          const detail = data.detail || data.error || "No se pudo cargar el resumen VIP.";
          if (rankingList) rankingList.innerHTML = `<div class="msg err" style="display:block">${escapeHtml(detail)}</div>`;
          if (dashTotalClientes) dashTotalClientes.textContent = "0";
          if (dashTotalSellos) dashTotalSellos.textContent = "0";
          if (dashPremiosPendientes) dashPremiosPendientes.textContent = "0";
          return;
        }

        dashTotalClientes.textContent = Number(data.totalCustomers || 0);
        dashTotalSellos.textContent = Number(data.totalStamps || 0);
        dashPremiosPendientes.textContent = Number(data.pendingRewards || 0);

        renderRanking(data.ranking || []);

        if (showRankingAfterLoad && rankingPanel) {
          rankingPanel.classList.add("show");
          rankingPanel.scrollIntoView({ behavior:"smooth", block:"start" });
        }
      } catch (err) {
        if (dashTotalClientes) dashTotalClientes.textContent = "0";
        if (dashTotalSellos) dashTotalSellos.textContent = "0";
        if (dashPremiosPendientes) dashPremiosPendientes.textContent = "0";
        if (rankingList) rankingList.innerHTML = `<div class="msg err" style="display:block">Error cargando resumen VIP: ${escapeHtml(err.message || String(err))}</div>`;
      }
    }

    function showLockOk(text) {
      lockMsgErr.style.display = "none";
      lockMsgOk.style.display = "block";
      lockMsgOk.textContent = text;
    }

    function showLockErr(text) {
      lockMsgOk.style.display = "none";
      lockMsgErr.style.display = "block";
      lockMsgErr.textContent = text;
    }

    function hideLockMessages() {
      lockMsgOk.style.display = "none";
      lockMsgErr.style.display = "none";
    }

    function showOk(text) {
      msgErr.style.display = "none";
      msgOk.style.display = "block";
      msgOk.textContent = text;
    }

    function showErr(text) {
      msgOk.style.display = "none";
      msgErr.style.display = "block";
      msgErr.textContent = text;
    }

    function hideMessages() {
      msgOk.style.display = "none";
      msgErr.style.display = "none";
    }

    function openPanel() {
      lockScreen.classList.add("hidden");
      adminPanel.classList.remove("hidden");
      loadCustomersSummary(false);
      setTimeout(() => buscarCelular.focus(), 100);
    }

    function closePanel() {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      adminPanel.classList.add("hidden");
      lockScreen.classList.remove("hidden");
      adminPassword.value = "";
      hideLockMessages();
      setTimeout(() => adminPassword.focus(), 100);
    }

    function tryAutoLogin() {
      const ok = localStorage.getItem(ADMIN_SESSION_KEY);
      if (ok === "1") {
        openPanel();
      } else {
        closePanel();
      }
    }

    function unlockPanel() {
      const pass = adminPassword.value.trim();
      hideLockMessages();

      if (!pass) {
        showLockErr("Escribe la clave.");
        return;
      }

      if (pass !== ADMIN_PASSWORD) {
        showLockErr("Clave incorrecta.");
        return;
      }

      localStorage.setItem(ADMIN_SESSION_KEY, "1");
      showLockOk("Clave correcta. Abriendo panel...");
      setTimeout(() => {
        openPanel();
      }, 400);
    }

    function getSuggestedRewardNote(stamps) {
      if (stamps >= 20) return "premio 20 sellos - plato de alitas";
      if (stamps >= 15) return "premio 15 sellos - burger clásica";
      if (stamps >= 10) return "premio 10 sellos - salchimix";
      if (stamps >= 5) return "premio 5 sellos - 1LT DE BEBIDA";
      return "";
    }

    function formatDateTime(value) {
      if (!value) return "-";
      try {
        const d = new Date(value);
        return d.toLocaleString("es-PE");
      } catch {
        return value;
      }
    }

    function renderHistory(movements) {
      if (!Array.isArray(movements) || movements.length === 0) {
        historyBox.innerHTML = "No hay movimientos registrados todavía.";
        return;
      }

      historyBox.innerHTML = movements.map(item => {
        const tipo = item.tipo || "-";
        const cantidad = Number(item.cantidad || 0);
        const nota = item.nota || "";
        const fecha = formatDateTime(item.created_at);

        return `
          <div class="history-item">
            <div><b>Tipo:</b> ${tipo}</div>
            <div><b>Cantidad:</b> ${cantidad}</div>
            <div><b>Nota:</b> ${nota || "-"}</div>
            <div><b>Fecha:</b> ${fecha}</div>
          </div>
        `;
      }).join("");
    }

    async function loadHistoryByCell(celular) {
      historyBox.innerHTML = "Cargando historial...";

      if (!celular) {
        historyBox.innerHTML = "Aquí aparecerán los últimos movimientos del cliente.";
        return;
      }

      try {
        const res = await fetch("/api/admin-get-history?celular=" + encodeURIComponent(celular));
        const data = await res.json();

        if (!res.ok) {
          historyBox.innerHTML = "No se pudo cargar el historial.";
          return;
        }

        renderHistory(data.movements || []);
      } catch (err) {
        historyBox.innerHTML = "Error cargando historial.";
      }
    }

    function renderCustomer(data) {
      currentCustomer = data.customer || null;
      currentCard = data.card || null;

      const actuales = Number(currentCard?.sellos_actuales || 0);
      const meta = Math.max(20, Number(currentCard?.meta_sellos || 20));
      const premioPendiente = !!currentCard?.premio_pendiente;
      const progress = Math.min(100, Math.round((actuales / meta) * 100));

      clienteNombre.textContent = currentCustomer?.nombre || "-";
      clienteCelular.textContent = currentCustomer?.celular || "-";
      clienteSellos.textContent = `${actuales} / ${meta}`;
      clientePremio.textContent = premioPendiente ? "Sí" : "No";
      clienteEstado.textContent = premioPendiente ? "Premio pendiente" : "Cliente cargado";
      progressText.textContent = progress + "%";
      barFill.style.width = progress + "%";

      if (premioPendiente) {
        stampNote.textContent = `Cliente tiene premio pendiente. Si ya se entregó, registra la nota y presiona "Entregar premio".`;
        if (!rewardNote.value.trim()) {
          rewardNote.value = getSuggestedRewardNote(actuales);
        }
      } else if ([5, 10, 15, 20].includes(actuales)) {
        stampNote.textContent = `Cliente llegó a ${actuales} sellos. Puedes entregar el premio correspondiente.`;
        if (!rewardNote.value.trim()) {
          rewardNote.value = getSuggestedRewardNote(actuales);
        }
      } else {
        stampNote.textContent = "Cliente cargado correctamente.";
      }

      loadHistoryByCell(currentCustomer?.celular || "");
      result.style.display = "block";
    }

    function clearView() {
      currentCustomer = null;
      currentCard = null;
      buscarCelular.value = "";
      rewardNote.value = "";
      clienteNombre.textContent = "-";
      clienteCelular.textContent = "-";
      clienteSellos.textContent = "0 / 20";
      clientePremio.textContent = "No";
      clienteEstado.textContent = "Cliente cargado";
      progressText.textContent = "0%";
      barFill.style.width = "0%";
      stampNote.textContent = "Busca un cliente para comenzar.";
      historyBox.innerHTML = "Aquí aparecerán los últimos movimientos del cliente.";
      result.style.display = "none";
      hideMessages();
    }

    async function searchCustomer() {
      const cel = buscarCelular.value.replace(/\D/g, "").trim();

      hideMessages();

      if (!cel) {
        showErr("Escribe un número de celular.");
        return;
      }

      try {
        const res = await fetch("/api/admin-find-customer?celular=" + encodeURIComponent(cel));
        const data = await res.json();

        if (!res.ok) {
          result.style.display = "none";
          showErr(data.error + (data.detail ? ": " + data.detail : ""));
          return;
        }

        rewardNote.value = "";
        renderCustomer(data);
        showOk("Cliente encontrado correctamente.");
      } catch (err) {
        result.style.display = "none";
        showErr("Error inesperado: " + (err.message || String(err)));
      }
    }


    async function deleteCustomerByPhone(celular) {
      const cleanCel = String(celular || "").replace(/\D/g, "").trim();

      hideMessages();

      if (!cleanCel) {
        showErr("No encontré el celular del cliente para eliminar.");
        return;
      }

      const ok = confirm(
        "⚠️ Vas a eliminar esta cuenta VIP completa.\\n\\nCelular: " +
        cleanCel +
        "\\n\\nSe eliminará el cliente, su tarjeta y su historial si existe.\\n\\n¿Deseas continuar?"
      );

      if (!ok) return;

      const typed = prompt('Para confirmar escribe: ELIMINAR');

      if (String(typed || "").trim().toUpperCase() !== "ELIMINAR") {
        showErr("Eliminación cancelada. No escribiste ELIMINAR.");
        return;
      }

      try {
        if (btnDeleteCustomer) {
          btnDeleteCustomer.disabled = true;
          btnDeleteCustomer.textContent = "Eliminando...";
        }

        const res = await fetch("/api/admin-delete-customer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            celular: cleanCel
          })
        });

        const data = await res.json();

        if (!res.ok || !data.ok) {
          showErr((data.error || "No se pudo eliminar.") + (data.detail ? ": " + data.detail : ""));
          return;
        }

        clearView();
        await loadCustomersSummary(true);
        showOk("✅ Cliente eliminado correctamente.");
      } catch (err) {
        showErr("Error inesperado eliminando cliente: " + (err.message || String(err)));
      } finally {
        if (btnDeleteCustomer) {
          btnDeleteCustomer.disabled = false;
          btnDeleteCustomer.textContent = "🗑️ Eliminar cuenta del cliente";
        }
      }
    }

    async function addStamp() {
      hideMessages();

      if (!currentCustomer || !currentCustomer.celular) {
        showErr("Primero busca un cliente.");
        return;
      }

      btnAddStamp.disabled = true;
      btnAddStamp.textContent = "Sumando...";

      try {
        const res = await fetch("/api/admin-add-stamp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            celular: currentCustomer.celular
          })
        });

        const data = await res.json();

        if (!res.ok) {
          showErr(data.error + (data.detail ? ": " + data.detail : ""));
          return;
        }

        renderCustomer(data);
        loadCustomersSummary(false);
        const stamps = Number(data.card?.sellos_actuales || 0);

        if ([5, 10, 15, 20].includes(stamps)) {
          showOk(`Se agregó 1 sello. Cliente llegó a ${stamps} sellos.`);
        } else {
          showOk("Se agregó 1 sello correctamente.");
        }
      } catch (err) {
        showErr("Error inesperado: " + (err.message || String(err)));
      } finally {
        btnAddStamp.disabled = false;
        btnAddStamp.textContent = "+1 sello";
      }
    }

    async function claimReward() {
      hideMessages();

      if (!currentCustomer || !currentCustomer.celular) {
        showErr("Primero busca un cliente.");
        return;
      }

      const note = rewardNote.value.trim();
      if (!note) {
        showErr("Escribe la nota del premio entregado.");
        return;
      }

      btnClaimReward.disabled = true;
      btnClaimReward.textContent = "Registrando...";

      try {
        const res = await fetch("/api/admin-claim-reward", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            celular: currentCustomer.celular,
            nota: note
          })
        });

        const data = await res.json();

        if (!res.ok) {
          showErr(data.error + (data.detail ? ": " + data.detail : ""));
          return;
        }

        rewardNote.value = "";
        renderCustomer(data);
        loadCustomersSummary(false);
        showOk("Premio marcado como entregado y guardado en historial.");
      } catch (err) {
        showErr("Error inesperado: " + (err.message || String(err)));
      } finally {
        btnClaimReward.disabled = false;
        btnClaimReward.textContent = "Entregar premio";
      }
    }

    btnUnlock.addEventListener("click", unlockPanel);
    btnLogout.addEventListener("click", closePanel);

    adminPassword.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        unlockPanel();
      }
    });

    btnBuscar.addEventListener("click", searchCustomer);
    btnAddStamp.addEventListener("click", addStamp);
    btnClaimReward.addEventListener("click", claimReward);
    btnRefresh.addEventListener("click", searchCustomer);
    btnClear.addEventListener("click", clearView);
    btnDeleteCustomer.addEventListener("click", () => {
      const celular = currentCustomer?.celular || clienteCelular.textContent || "";
      deleteCustomerByPhone(celular);
    });

    rankingList.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-delete-phone]");
      if (!btn) return;
      deleteCustomerByPhone(btn.getAttribute("data-delete-phone"));
    });

    btnShowRanking.addEventListener("click", () => {
      rankingPanel.classList.add("show");
      loadCustomersSummary(true);
    });

    btnHideRanking.addEventListener("click", () => {
      rankingPanel.classList.remove("show");
    });

    btnRefreshSummary.addEventListener("click", () => loadCustomersSummary(false));
    btnReloadSummary.addEventListener("click", () => loadCustomersSummary(true));

    buscarCelular.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        searchCustomer();
      }
    });

    tryAutoLogin();
  </script>
</body>
</html>

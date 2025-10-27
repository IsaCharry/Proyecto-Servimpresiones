// Año en footer y en bloque de contacto
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
const yearContact = document.getElementById('year-contact');
if (yearContact) yearContact.textContent = new Date().getFullYear();

/* ====== Carrito (localStorage) ====== */
const LS_KEY='cart.items.v1';
const money = n => n.toLocaleString('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0});
const getCart=()=>{ try{return JSON.parse(localStorage.getItem(LS_KEY))||[]}catch{ return []; } };
const setCart=it=>{ localStorage.setItem(LS_KEY, JSON.stringify(it)); renderCart(); };

function addToCart(item){
  const items = getCart();
  const i = items.findIndex(p=>p.id===item.id);
  if(i>=0) items[i].qty += item.qty||1;
  else items.push({id:item.id, name:item.name, price:item.price, qty:item.qty||1});
  setCart(items);
}
function updateQty(id,delta){ const it=getCart(); const i=it.findIndex(p=>p.id===id); if(i<0)return; it[i].qty=Math.max(1,it[i].qty+delta); setCart(it); }
function removeItem(id){ setCart(getCart().filter(p=>p.id!==id)); }

function renderCart(){
  const list=document.getElementById('cartList'),
        empty=document.getElementById('cartEmpty'),
        sum=document.getElementById('cartSummary');
  if(!list) return;
  const items=getCart(); list.innerHTML='';
  if(items.length===0){ empty.hidden=false; sum.hidden=true; return; }
  empty.hidden=true; sum.hidden=false;
  let subtotal=0;
  items.forEach(p=>{
    subtotal += p.price*p.qty;
    const el=document.createElement('div'); el.className='cart-item';
    el.innerHTML=`
      <div><strong>${p.name}</strong><div class="muted" style="font-size:.9rem">${money(p.price)} c/u</div></div>
      <div class="qty">
        <button aria-label="Menos" onclick="updateQty('${p.id}',-1)">–</button>
        <div>${p.qty}</div>
        <button aria-label="Más" onclick="updateQty('${p.id}',1)">+</button>
      </div>
      <div><strong>${money(p.price*p.qty)}</strong></div>
      <div><button class="remove" onclick="removeItem('${p.id}')">Quitar</button></div>`;
    list.appendChild(el);
  });
  document.getElementById('cartSubtotal').textContent = money(subtotal);
}

// Abrir/Cerrar modales
const openModal=id=>document.getElementById(id).setAttribute('aria-hidden','false');
const closeModal=el=>el.closest('.modal').setAttribute('aria-hidden','true');

document.getElementById('btnCart')?.addEventListener('click', ()=>{ renderCart(); openModal('cartModal'); });
document.getElementById('btnAccount')?.addEventListener('click', ()=> openModal('authModal'));
document.querySelectorAll('.modal [data-close]').forEach(b=> b.addEventListener('click', e=> closeModal(e.target)));
document.querySelectorAll('.modal').forEach(m=> m.addEventListener('click',e=>{ if(e.target.classList.contains('modal')) m.setAttribute('aria-hidden','true'); }));

// Checkout (cambia la URL si ya tienes página de pago)
document.getElementById('btnCheckout')?.addEventListener('click', ()=>{
  if(getCart().length===0){ alert('Tu carrito está vacío.'); return; }
  location.href = 'pago.html';
});

// Ganchos globales: botones "Añadir al carrito"
document.addEventListener('click', e=>{
  const btn = e.target.closest('.js-add-to-cart'); if(!btn) return;
  const id = btn.dataset.id || btn.dataset.name || ('prod-'+Date.now());
  const name = btn.dataset.name || 'Producto';
  const price = Number(btn.dataset.price||'0');
  addToCart({id,name,price,qty:1});
  btn.disabled=true; const old=btn.textContent; btn.textContent='✓ Añadido'; setTimeout(()=>{btn.disabled=false; btn.textContent=old;},1100);
});

/* ====== Tabs login/registro (modal cuenta) ====== */
(function(){
  const tabL=document.getElementById('tab-login'), tabR=document.getElementById('tab-register');
  const pL=document.getElementById('panel-login'), pR=document.getElementById('panel-register');
  if(!tabL) return;
  function sel(isLogin){
    tabL.setAttribute('aria-selected', isLogin?'true':'false');
    tabR.setAttribute('aria-selected', isLogin?'false':'true');
    pL.hidden = !isLogin; pR.hidden = isLogin;
  }
  tabL.onclick=()=>sel(true); tabR.onclick=()=>sel(false); sel(true);
  document.getElementById('formLogin').onsubmit=e=>{ e.preventDefault(); alert('✅ Sesión iniciada (demo)'); closeModal(document.querySelector('#authModal .close')); };
  document.getElementById('formRegister').onsubmit=e=>{ e.preventDefault(); alert('✅ Cuenta creada (demo)'); closeModal(document.querySelector('#authModal .close')); };
})();

/* ====== Envío “demo” del formulario de contacto ====== */
const contactForm = document.getElementById('contactForm');
if (contactForm){
  contactForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(contactForm).entries());
    // Aquí integra tu servicio real: EmailJS, Formspree o backend propio.
    alert('✅ ¡Mensaje enviado!\n\n' +
      `Nombre: ${data.name}\nCorreo: ${data.email}\nMensaje: ${data.message}`);
    contactForm.reset();
  });
}
/* ====== Galería: Tabs por categoría ====== */
(function(){
  const tabs = Array.from(document.querySelectorAll('.gal-tab'));
  if(!tabs.length) return;

  const sections = tabs.map(t => document.getElementById(t.dataset.target)).filter(Boolean);

  function show(id){
    tabs.forEach(t => t.classList.toggle('active', t.dataset.target === id));
    sections.forEach(s => s.hidden = (s.id !== id));
    // Actualizar hash sin hacer scroll brusco
    history.replaceState(null, '', '#'+id);
  }

  // Click en tabs
  tabs.forEach(t => t.addEventListener('click', () => show(t.dataset.target)));

  // Abrir según hash (o T-Shirts por defecto)
  const hash = (location.hash || '#tshirts').slice(1);
  const valid = sections.some(s => s.id === hash) ? hash : 'tshirts';
  show(valid);
})();

/* ====== Carruseles (uno por sección) ====== */
(function(){
  const cars = Array.from(document.querySelectorAll('[data-car]'));
  if(!cars.length) return;

  cars.forEach(initCarousel);

  function initCarousel(root){
    const track = root.querySelector('.car-track');
    const viewport = root.querySelector('.car-viewport');
    const prev = root.querySelector('.car-btn.prev');
    const next = root.querySelector('.car-btn.next');
    const dotsWrap = root.querySelector('.car-dots');
    const items = () => Array.from(track.querySelectorAll('.car-item'));

    let index = 0, perView = 3, pages = 1;

    function calcPerView(){
      const w = viewport.clientWidth;
      if(w < 560) perView = 1;
      else if(w < 980) perView = 2;
      else perView = 3;
    }
    function totalPages(){ return Math.max(1, Math.ceil(items().length / perView)); }

    function renderDots(){
      dotsWrap.innerHTML = '';
      pages = totalPages();
      for(let i=0;i<pages;i++){
        const b = document.createElement('button');
        b.addEventListener('click', ()=>{ index = i; update(); });
        dotsWrap.appendChild(b);
      }
    }

    function update(){
      calcPerView();
      pages = totalPages();
      index = Math.max(0, Math.min(index, pages-1));
      // ancho de un item + gap (12px). Mejor tomar el real:
      const first = items()[0];
      const itemW = first.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(track).gap) || 12;
      track.style.transform = `translateX(${-index * (itemW*perView + gap*index)}px)`;

      dotsWrap.querySelectorAll('button').forEach((d,i)=>d.classList.toggle('active', i===index));
    }

    // Listeners
    prev.addEventListener('click', ()=>{ index = Math.max(0, index - 1); update(); });
    next.addEventListener('click', ()=>{ index = Math.min(pages - 1, index + 1); update(); });
    window.addEventListener('resize', update);

    // Inicial
    renderDots(); update();
  }
})();

/* ====== Personalizador: carga y opciones ====== */
(function(){
  const wrap = document.querySelector('.customiz-wrap');
  if(!wrap) return;

  // Mapeo de productos: id -> nombre, precio base e imágenes (frente/reverso)
  const PRODUCTS = {
    tshirt : { name:'T-Shirt', base: 432000, front:'assets/img/mockups/tshirt-front.png', back:'assets/img/mockups/tshirt-back.png' },
    hoodie : { name:'Hoodie',  base: 432000, front:'assets/img/mockups/hoodie-front.png', back:'assets/img/mockups/hoodie-back.png' },
    termo  : { name:'Termo',   base: 432000, front:'assets/img/mockups/termo.png',       back:'assets/img/mockups/termo.png' },
    libreta: { name:'Libreta', base: 432000, front:'assets/img/mockups/libreta.png',     back:'assets/img/mockups/libreta.png' },
    pin    : { name:'Pin',     base: 432000, front:'assets/img/mockups/pin.png',         back:'assets/img/mockups/pin.png' },
  };

  // 1) resolver producto por query ?product=xxx
  const params = new URLSearchParams(location.search);
  const pid = (params.get('product')||'tshirt').toLowerCase();
  const prod = PRODUCTS[pid] || PRODUCTS.tshirt;

  // 2) referencias UI
  const imgBase = document.getElementById('imgBase');
  const imgBack = document.getElementById('imgBack');
  const tint    = document.getElementById('tint');
  const imgStamp= document.getElementById('imgStamp');
  const txtStamp= document.getElementById('txtStamp');
  const qty     = document.getElementById('qty');
  const price   = document.getElementById('price');
  const prodName= document.getElementById('prodName');
  const prodInfo= document.getElementById('prodInfo');
  const btnAdd  = document.getElementById('btnAddCart');

  // 3) set inicial
  prodName.textContent = prod.name;
  prodInfo.textContent = 'Personaliza a tu gusto.';
  imgBase.src = prod.front;
  imgBack.src = prod.back;
  tint.style.background = '#1f2937'; // color inicial
  updatePrice();

  // 4) tallas
  document.querySelectorAll('.chip-row .chip').forEach(ch=>{
    ch.addEventListener('click',()=>{
      document.querySelectorAll('.chip-row .chip').forEach(x=>x.classList.remove('selected'));
      ch.classList.add('selected');
    });
  });

  // 5) color
  document.querySelectorAll('#colorRow input[name="color"]').forEach(r=>{
    r.addEventListener('change', ()=>{ tint.style.background = r.value; });
  });

  // 6) imagen subida
  document.getElementById('uploadImg').addEventListener('change', (e)=>{
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{ imgStamp.src = reader.result; imgStamp.style.display='block'; };
    reader.readAsDataURL(file);
  });
  document.getElementById('imgScale').addEventListener('input', (e)=>{
    const v = Number(e.target.value);
    imgStamp.style.maxWidth = v + '%';
  });

  // 7) texto
  const txt = document.getElementById('txtText');
  const txtSize = document.getElementById('txtSize');
  const txtColor= document.getElementById('txtColor');
  function renderText(){
    const val = (txt.value||'').trim();
    txtStamp.textContent = val;
    txtStamp.style.fontSize = (Number(txtSize.value)||28) + 'px';
    txtStamp.style.color = txtColor.value;
    txtStamp.style.display = val ? 'block':'none';
  }
  txt.addEventListener('input', renderText);
  txtSize.addEventListener('input', renderText);
  txtColor.addEventListener('input', renderText);
  renderText();

  // 8) precio
  function updatePrice(){
    const q = Math.max(1, Number(qty.value)||1);
    qty.value = q;
    price.value = (prod.base * q).toLocaleString('es-CO');
  }
  qty.addEventListener('input', updatePrice);
  qty.addEventListener('change', updatePrice);

  // 9) Añadir al carrito (localStorage 'cart')
  btnAdd.addEventListener('click', ()=>{
    const selSize = document.querySelector('.chip-row .chip.selected')?.dataset.size || 'S';
    const selColor = (document.querySelector('#colorRow input[name="color"]:checked')||{}).value || '#1f2937';
    const q = Math.max(1, Number(qty.value)||1);
    const item = {
      id: pid, name: prod.name, size: selSize, color: selColor,
      qty: q, unit: prod.base, total: prod.base*q,
      note: txt.value||'',
    };
    // guardar en carrito
    try{
      const cart = JSON.parse(localStorage.getItem('cart')||'[]');
      cart.push(item);
      localStorage.setItem('cart', JSON.stringify(cart));
      alert('✓ Producto añadido al carrito');
    }catch(e){
      alert('No se pudo guardar el carrito, pero tu selección está lista.');
    }
    // si tienes modal de carrito en esta página puedes abrirlo aquí
  });

  // año footer
  const y = document.getElementById('year'); if(y) y.textContent = new Date().getFullYear();
})();

/* ========= Personalizador con opciones por producto ========= */
(function(){
  const root = document.querySelector('.customiz-wrap');
  if(!root) return;

  // Catálogo de productos con opciones y recargos
  const CATALOG = {
    tshirt : { type:'apparel', name:'T-Shirt', base: 432000,
      mock:{front:'assets/img/mockups/tshirt-front.png', back:'assets/img/mockups/tshirt-back.png'}
    },
    hoodie : { type:'apparel', name:'Hoodie', base: 432000,
      mock:{front:'assets/img/mockups/hoodie-front.png', back:'assets/img/mockups/hoodie-back.png'}
    },
    termo  : { type:'termo', name:'Termo', base: 380000,
      mock:{front:'assets/img/mockups/termo.png', back:'assets/img/mockups/termo.png'},
      opts:{
        capacidad:[{v:'350', label:'350 ml', add:0},{v:'500', label:'500 ml', add:30000},{v:'750', label:'750 ml', add:60000}],
        tapa:[{v:'rosca', label:'Rosca', add:0},{v:'flip', label:'Flip-top', add:15000}]
      }
    },
    libreta: { type:'libreta', name:'Libreta', base: 280000,
      mock:{front:'assets/img/mockups/libreta.png', back:'assets/img/mockups/libreta.png'},
      opts:{
        tam:[{v:'A6', add:0},{v:'A5', add:20000},{v:'A4', add:50000}],
        hojas:[{v:'80', label:'80 hojas', add:0},{v:'120', label:'120 hojas', add:18000}],
        papel:[{v:'bond', label:'Bond', add:0},{v:'reciclado', label:'Reciclado', add:12000},{v:'pauta', label:'Pauta', add:8000}],
        anillo:[{v:'negro', label:'Anillo negro', add:0},{v:'plata', label:'Anillo plata', add:6000}]
      }
    },
    pin    : { type:'pin', name:'Pin', base: 120000,
      mock:{front:'assets/img/mockups/pin.png', back:'assets/img/mockups/pin.png'},
      opts:{
        forma:[{v:'redondo', add:0},{v:'cuadrado', add:0},{v:'corazon', label:'Corazón', add:5000}],
        tam:[{v:'25', label:'25 mm', add:0},{v:'32', label:'32 mm', add:4000},{v:'50', label:'50 mm', add:9000}],
        acabado:[{v:'mate', label:'Mate', add:0},{v:'brillante', label:'Brillante', add:3000}],
        sujeccion:[{v:'imperdible', label:'Imperdible', add:0},{v:'iman', label:'Imán', add:7000}]
      }
    }
  };

  // Producto desde la URL (?product=)
  const q = new URLSearchParams(location.search);
  const pid = (q.get('product') || 'tshirt').toLowerCase();
  const PROD = CATALOG[pid] || CATALOG.tshirt;

  // Referencias UI
  const imgBase = document.getElementById('imgBase');
  const imgBack = document.getElementById('imgBack');
  const tint    = document.getElementById('tint');
  const imgStamp= document.getElementById('imgStamp');
  const txtStamp= document.getElementById('txtStamp');
  const qty     = document.getElementById('qty');
  const price   = document.getElementById('price');
  const prodName= document.getElementById('prodName');
  const prodInfo= document.getElementById('prodInfo');
  const sizeRow = document.getElementById('sizeRow');
  const dyn     = document.getElementById('dynOptions');

  // Estado
  const state = {
    size:'S',
    color:'#1f2937',
    termo:{capacidad:'350', tapa:'rosca'},
    libreta:{tam:'A6', hojas:'80', papel:'bond', anillo:'negro'},
    pin:{forma:'redondo', tam:'25', acabado:'mate', sujeccion:'imperdible'}
  };

  // Inicial
  prodName.textContent = PROD.name;
  prodInfo.textContent = 'Personaliza a tu gusto.';
  imgBase.src = PROD.mock.front;
  imgBack.src = PROD.mock.back;
  tint.style.background = state.color;

  // Tallas visibles solo en ropa
  sizeRow.style.display = (PROD.type === 'apparel') ? 'flex' : 'none';

  // Construir selects dinámicos
  dyn.innerHTML = '';
  const makeSelect = (group, key, label, options, current) => {
    const box = document.createElement('div');
    box.className = 'opt-box';
    box.innerHTML = `<div class="opt-title">${label}</div>`;
    const sel = document.createElement('select');
    sel.className = 'input';
    options.forEach(o=>{
      const op = document.createElement('option');
      op.value = o.v;
      op.textContent = o.label || o.v;
      op.dataset.add = o.add || 0;
      if(o.v === current) op.selected = true;
      sel.appendChild(op);
    });
    sel.addEventListener('change', ()=>{ state[group][key] = sel.value; updatePrice(); });
    box.appendChild(sel);
    return box;
  };

  if(PROD.type === 'termo'){
    dyn.appendChild(makeSelect('termo','capacidad','Capacidad',PROD.opts.capacidad,state.termo.capacidad));
    dyn.appendChild(makeSelect('termo','tapa','Tipo de tapa',PROD.opts.tapa,state.termo.tapa));
  }
  if(PROD.type === 'libreta'){
    dyn.appendChild(makeSelect('libreta','tam','Tamaño',PROD.opts.tam,state.libreta.tam));
    dyn.appendChild(makeSelect('libreta','hojas','Número de hojas',PROD.opts.hojas,state.libreta.hojas));
    dyn.appendChild(makeSelect('libreta','papel','Tipo de papel',PROD.opts.papel,state.libreta.papel));
    dyn.appendChild(makeSelect('libreta','anillo','Anillado',PROD.opts.anillo,state.libreta.anillo));
  }
  if(PROD.type === 'pin'){
    dyn.appendChild(makeSelect('pin','forma','Forma',PROD.opts.forma,state.pin.forma));
    dyn.appendChild(makeSelect('pin','tam','Tamaño',PROD.opts.tam,state.pin.tam));
    dyn.appendChild(makeSelect('pin','acabado','Terminación',PROD.opts.acabado,state.pin.acabado));
    dyn.appendChild(makeSelect('pin','sujeccion','Sujeción',PROD.opts.sujeccion,state.pin.sujeccion));
  }

  // Colores
  document.querySelectorAll('#colorRow input[name="color"]').forEach(r=>{
    r.addEventListener('change', ()=>{ state.color = r.value; tint.style.background = state.color; });
  });

  // Tallas
  document.querySelectorAll('.chip-row .chip').forEach(ch=>{
    ch.addEventListener('click',()=>{
      document.querySelectorAll('.chip-row .chip').forEach(x=>x.classList.remove('selected'));
      ch.classList.add('selected');
      state.size = ch.dataset.size;
    });
  });

  // Imagen subida
  document.getElementById('uploadImg').addEventListener('change', e=>{
    const f = e.target.files?.[0]; if(!f) return;
    const fr = new FileReader();
    fr.onload = ()=>{ imgStamp.src = fr.result; imgStamp.style.display='block'; };
    fr.readAsDataURL(f);
  });
  document.getElementById('imgScale').addEventListener('input', e=>{
    imgStamp.style.maxWidth = (Number(e.target.value)||70) + '%';
  });

  // Texto
  const txt = document.getElementById('txtText');
  const txtSize = document.getElementById('txtSize');
  const txtColor= document.getElementById('txtColor');
  function renderText(){
    const v = (txt.value||'').trim();
    txtStamp.textContent = v;
    txtStamp.style.display = v ? 'block':'none';
    txtStamp.style.fontSize = (Number(txtSize.value)||28) + 'px';
    txtStamp.style.color = txtColor.value;
  }
  txt.addEventListener('input',renderText);
  txtSize.addEventListener('input',renderText);
  txtColor.addEventListener('input',renderText);
  renderText();

  // Precio
  function pickAdd(arr, val){ return (arr.find(x=>x.v==val)?.add)||0; }
  function addonsTotal(){
    let add = 0;
    if(PROD.type==='termo'){
      add += pickAdd(PROD.opts.capacidad, state.termo.capacidad);
      add += pickAdd(PROD.opts.tapa,       state.termo.tapa);
    }
    if(PROD.type==='libreta'){
      add += pickAdd(PROD.opts.tam,    state.libreta.tam);
      add += pickAdd(PROD.opts.hojas,  state.libreta.hojas);
      add += pickAdd(PROD.opts.papel,  state.libreta.papel);
      add += pickAdd(PROD.opts.anillo, state.libreta.anillo);
    }
    if(PROD.type==='pin'){
      add += pickAdd(PROD.opts.tam,       state.pin.tam);
      add += pickAdd(PROD.opts.acabado,   state.pin.acabado);
      add += pickAdd(PROD.opts.sujeccion, state.pin.sujeccion);
    }
    return add;
  }
  function updatePrice(){
    const q = Math.max(1, Number(qty.value)||1);
    const total = (PROD.base + addonsTotal()) * q;
    price.value = total.toLocaleString('es-CO');
  }
  qty.addEventListener('input', updatePrice);
  qty.addEventListener('change', updatePrice);
  updatePrice();

  // Añadir al carrito 
  document.getElementById('btnAddCart').addEventListener('click', ()=>{
    const item = {
      id: pid,
      name: PROD.name,
      qty: Math.max(1, Number(qty.value)||1),
      size: (PROD.type==='apparel') ? state.size : undefined,
      color: state.color,
      opts: (PROD.type==='termo')? state.termo
          : (PROD.type==='libreta')? state.libreta
          : (PROD.type==='pin')? state.pin : {},
      unit: PROD.base + addonsTotal(),
      total: (PROD.base + addonsTotal()) * Math.max(1, Number(qty.value)||1)
    };
    try{
      const cart = JSON.parse(localStorage.getItem('cart')||'[]');
      cart.push(item);
      localStorage.setItem('cart', JSON.stringify(cart));
      alert('✓ Añadido al carrito');
    }catch(e){ alert('No se pudo guardar el carrito'); }
  });

  // Año en footer
  const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
})();

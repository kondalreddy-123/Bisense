/**
 * BISENSE - Three.js 3D Visualizations
 * Optimized for Pristine White / Light Background:
 * 1. Hero AI Engine Visualization (Vibrant Sapphire & Azure Core)
 * 2. Semantic Search Relevance Graph
 * 3. Architecture 3D Stack
 * 4. Related Standards 3D Constellation
 * 5. CTA Background Particle Grid
 */

const ThreeScenes = {
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,

  // =========================================================================
  // 1. HERO SCENE: CENTRAL BISENSE AI ENGINE (LIGHT / WHITE THEME)
  // =========================================================================
  initHeroScene() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const container = document.getElementById('heroCanvasContainer');
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf8fafc, 0.018);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Vibrant Lighting for Light Background
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const mainPoint = new THREE.PointLight(0x0052cc, 2.5, 30);
    mainPoint.position.set(0, 0, 3);
    scene.add(mainPoint);

    const cyanPoint = new THREE.PointLight(0x0284c7, 2.0, 30);
    cyanPoint.position.set(-6, 4, -2);
    scene.add(cyanPoint);

    const purplePoint = new THREE.PointLight(0x7c3aed, 1.8, 30);
    purplePoint.position.set(6, -4, -2);
    scene.add(purplePoint);

    // AI Core Group
    const engineGroup = new THREE.Group();
    scene.add(engineGroup);

    // Central Glowing Sphere (AI Core)
    const coreGeo = new THREE.IcosahedronGeometry(1.6, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x0052cc,
      emissive: 0x0284c7,
      emissiveIntensity: 0.55,
      roughness: 0.25,
      metalness: 0.7,
      wireframe: true
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.userData = { title: "BISENSE AI Core", type: "CENTRAL ENGINE", desc: "Multilingual NLP & Vector Processing Engine" };
    engineGroup.add(coreMesh);

    // Inner Solid Core Sphere
    const innerGeo = new THREE.SphereGeometry(1.15, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.22
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    engineGroup.add(innerMesh);

    // Concentric Orbital Rings
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x0052cc, wireframe: true, transparent: true, opacity: 0.45 });
    const ringGeo1 = new THREE.TorusGeometry(3.0, 0.02, 16, 100);
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    engineGroup.add(ring1);

    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x7c3aed, wireframe: true, transparent: true, opacity: 0.4 });
    const ringGeo2 = new THREE.TorusGeometry(4.4, 0.02, 16, 100);
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 4;
    engineGroup.add(ring2);

    const ringMat3 = new THREE.MeshBasicMaterial({ color: 0x0284c7, wireframe: true, transparent: true, opacity: 0.35 });
    const ringGeo3 = new THREE.TorusGeometry(5.8, 0.02, 16, 100);
    const ring3 = new THREE.Mesh(ringGeo3, ringMat3);
    ring3.rotation.x = -Math.PI / 4;
    engineGroup.add(ring3);

    // Interactive Nodes (Products & Standards)
    const interactiveObjects = [coreMesh];

    const productNodesData = [
      { name: "Electric Cooker", type: "PRODUCT", desc: "IS 302-2-15 Candidate", pos: [-3.8, 1.8, 1.0], color: 0x0052cc },
      { name: "Electric Fan (BLDC)", type: "PRODUCT", desc: "IS 374 Ceiling Fans", pos: [3.8, 2.0, -1.0], color: 0x0284c7 },
      { name: "Electric Iron", type: "PRODUCT", desc: "IS 302-2-3 Dry/Steam Irons", pos: [-4.2, -2.2, -0.5], color: 0x0052cc },
      { name: "Electrical Cables", type: "PRODUCT", desc: "IS 694 PVC Building Wire", pos: [4.4, -1.8, 1.5], color: 0x0284c7 },
      { name: "LED Lamp (9W B22)", type: "PRODUCT", desc: "IS 16102 General Lighting", pos: [0.0, 4.2, -1.5], color: 0x7c3aed },
      { name: "IS 302-2-15", type: "STANDARD", desc: "Heating Liquids Safety Standard", pos: [-2.2, 3.6, 2.0], color: 0x0052cc },
      { name: "IS 374", type: "STANDARD", desc: "Ceiling Fan Specification", pos: [2.5, 3.5, 1.8], color: 0x0284c7 },
      { name: "IS 694", type: "STANDARD", desc: "PVC Insulated Cables Specification", pos: [3.0, -3.6, -1.2], color: 0x0052cc },
      { name: "IS 302-1", type: "BASE STANDARD", desc: "Master General Safety Requirements", pos: [-2.5, -3.8, 1.5], color: 0x7c3aed }
    ];

    const nodeGroup = new THREE.Group();
    engineGroup.add(nodeGroup);

    productNodesData.forEach((d) => {
      const geo = d.type.includes("STANDARD") 
        ? new THREE.BoxGeometry(0.55, 0.7, 0.12) 
        : new THREE.SphereGeometry(0.35, 16, 16);
      
      const mat = new THREE.MeshStandardMaterial({
        color: d.color,
        emissive: d.color,
        emissiveIntensity: 0.4,
        roughness: 0.3,
        metalness: 0.6
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(d.pos[0], d.pos[1], d.pos[2]);
      mesh.userData = { title: d.name, type: d.type, desc: d.desc, originalColor: d.color };
      nodeGroup.add(mesh);
      interactiveObjects.push(mesh);

      // Connecting line to core
      const lineMat = new THREE.LineBasicMaterial({
        color: d.color,
        transparent: true,
        opacity: 0.3
      });
      const points = [new THREE.Vector3(0, 0, 0), mesh.position];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeo, lineMat);
      engineGroup.add(line);
    });

    // Particle Field (Search Data Stream)
    const particleCount = 260;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = [];

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 2.0 + Math.random() * 6.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i + 2] = radius * Math.cos(phi);

      particleSpeeds.push({
        radius: radius,
        speed: (Math.random() * 0.004 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
        theta: theta,
        phi: phi
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x0052cc,
      size: 0.08,
      transparent: true,
      opacity: 0.65
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    engineGroup.add(particleSystem);

    // Mouse Interaction & Camera Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x;
      mouseY = y;
      targetX = x * 1.5;
      targetY = y * 1.0;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Raycaster for Hover and Click
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const hud = document.getElementById('heroHud');
    const hudTitle = document.getElementById('hudTitle');
    const hudTag = document.getElementById('hudTag');
    const hudDesc = document.getElementById('hudDesc');
    const hudClose = document.getElementById('hudClose');

    if (hudClose) {
      hudClose.addEventListener('click', () => {
        hud.style.display = 'none';
      });
    }

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects);

      if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (obj.userData && obj.userData.title) {
          hudTitle.textContent = obj.userData.title;
          hudTag.textContent = obj.userData.type || 'AI NODE';
          hudDesc.textContent = obj.userData.desc || '';
          hud.style.display = 'block';
        }
      }
    });

    // Resize Handler
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop with Visibility Optimization
    let isVisible = true;
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    });
    observer.observe(container);

    let clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsed = clock.getElapsedTime();

      // Slow rotation
      if (!ThreeScenes.reducedMotion) {
        engineGroup.rotation.y += 0.003;
        ring1.rotation.z += 0.005;
        ring2.rotation.x += 0.004;
        ring3.rotation.y += 0.003;
        coreMesh.rotation.x += 0.006;
        coreMesh.rotation.y += 0.008;

        // Pulse core
        const scale = 1.0 + Math.sin(elapsed * 2.5) * 0.06;
        innerMesh.scale.set(scale, scale, scale);

        // Particle stream movement
        const positions = particleGeo.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          const sp = particleSpeeds[i];
          sp.theta += sp.speed;
          const idx = i * 3;
          positions[idx] = sp.radius * Math.sin(sp.phi) * Math.cos(sp.theta);
          positions[idx + 1] = sp.radius * Math.sin(sp.phi) * Math.sin(sp.theta);
          positions[idx + 2] = sp.radius * Math.cos(sp.phi);
        }
        particleGeo.attributes.position.needsUpdate = true;

        // Camera damping
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (targetY - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animate();
  },

  // =========================================================================
  // 2. RELEVANCE 3D GRAPH: USER QUERY -> CANDIDATE STANDARDS
  // =========================================================================
  relevanceApp: null,

  initRelevanceGraph(results = []) {
    const canvas = document.getElementById('relevanceCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const parent = canvas.parentElement;
    const width = parent.clientWidth;
    const height = parent.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x0052cc, 2.2, 20);
    pointLight.position.set(0, 2, 4);
    scene.add(pointLight);

    const graphGroup = new THREE.Group();
    scene.add(graphGroup);

    // Center Query Node (Deep Royal Blue)
    const queryGeo = new THREE.SphereGeometry(0.45, 24, 24);
    const queryMat = new THREE.MeshStandardMaterial({
      color: 0x0052cc,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
      roughness: 0.2
    });
    const queryNode = new THREE.Mesh(queryGeo, queryMat);
    queryNode.position.set(0, 1.8, 0);
    queryNode.userData = { isQuery: true, title: "USER REQUIREMENT", score: 1.0 };
    graphGroup.add(queryNode);

    // Inner Query Pulse Ring
    const qRingGeo = new THREE.RingGeometry(0.55, 0.62, 32);
    const qRingMat = new THREE.MeshBasicMaterial({ color: 0x0052cc, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const qRing = new THREE.Mesh(qRingGeo, qRingMat);
    qRing.position.copy(queryNode.position);
    graphGroup.add(qRing);

    // Candidate Standard Nodes
    const candidateNodes = [];
    const interactiveNodes = [queryNode];
    const topResults = (results && results.length > 0) ? results.slice(0, 6) : [
      { is_number: "IS 302-2-15", title: "Electric Cookers", score: 0.88, relevance: "High" },
      { is_number: "IS 302-1", title: "General Safety", score: 0.78, relevance: "Medium" },
      { is_number: "IS 9000", title: "Environmental Testing", score: 0.68, relevance: "Moderate" }
    ];

    const count = topResults.length;
    const startX = -((count - 1) * 1.3) / 2;

    topResults.forEach((res, i) => {
      const score = res.score || 0.75;
      const radius = 0.24 + score * 0.25;

      const isHigh = score >= 0.82;
      const nodeColor = isHigh ? 0x0052cc : 0x0284c7;

      const stdGeo = new THREE.SphereGeometry(radius, 20, 20);
      const stdMat = new THREE.MeshStandardMaterial({
        color: nodeColor,
        emissive: nodeColor,
        emissiveIntensity: 0.35,
        roughness: 0.3
      });

      const stdMesh = new THREE.Mesh(stdGeo, stdMat);
      const posX = startX + i * 1.35;
      const posY = -1.2 + (Math.abs(posX) * 0.15);
      const posZ = (Math.random() - 0.5) * 0.4;

      stdMesh.position.set(posX, posY, posZ);
      stdMesh.userData = {
        is_number: res.is_number,
        year_recorded: res.year_recorded,
        title: res.title,
        score: Math.round(score * 100),
        id: res.id || res.is_number
      };

      graphGroup.add(stdMesh);
      candidateNodes.push(stdMesh);
      interactiveNodes.push(stdMesh);

      // Connecting Beam
      const lineMat = new THREE.LineBasicMaterial({
        color: nodeColor,
        transparent: true,
        opacity: Math.max(0.25, score * 0.5)
      });
      const points = [queryNode.position, stdMesh.position];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeo, lineMat);
      graphGroup.add(line);
    });

    // Tooltip and Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const tooltip = document.getElementById('r3dTooltip');

    const onCanvasMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveNodes);

      if (intersects.length > 0) {
        const obj = intersects[0].object;
        canvas.style.cursor = 'pointer';

        if (tooltip) {
          if (obj.userData.isQuery) {
            tooltip.innerHTML = `<strong>USER REQUIREMENT</strong><br>384-dim Vector Core`;
          } else {
            const yr = obj.userData.year_recorded ? ` (${obj.userData.year_recorded})` : '';
            tooltip.innerHTML = `<strong>${obj.userData.is_number}${yr}</strong><br>Relevance: <span style="color:#0052cc; font-weight:700;">${obj.userData.score}%</span>`;
          }
          tooltip.style.left = `${e.clientX - rect.left + 15}px`;
          tooltip.style.top = `${e.clientY - rect.top - 20}px`;
          tooltip.style.display = 'block';
        }
      } else {
        canvas.style.cursor = 'default';
        if (tooltip) tooltip.style.display = 'none';
      }
    };

    canvas.addEventListener('mousemove', onCanvasMouseMove);

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(candidateNodes);

      if (intersects.length > 0) {
        const obj = intersects[0].object;
        const targetId = obj.userData.id;
        const card = document.getElementById(`card-${targetId}`) || document.querySelector(`[data-is="${obj.userData.is_number}"]`);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.classList.add('highlight-target');
          setTimeout(() => card.classList.remove('highlight-target'), 2000);
        }
      }
    });

    let clock = new THREE.Clock();
    let animId = null;

    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);
      const elapsed = clock.getElapsedTime();

      graphGroup.rotation.y = Math.sin(elapsed * 0.5) * 0.15;
      qRing.scale.setScalar(1.0 + Math.sin(elapsed * 3) * 0.08);

      candidateNodes.forEach((node, idx) => {
        node.position.y += Math.sin(elapsed * 2 + idx) * 0.0015;
      });

      renderer.render(scene, camera);
    };

    renderLoop();

    this.relevanceApp = {
      destroy: () => {
        cancelAnimationFrame(animId);
        renderer.dispose();
      }
    };
  },

  // =========================================================================
  // 3. ARCHITECTURE 3D STACK SCENE (LIGHT THEME)
  // =========================================================================
  initArchScene() {
    const canvas = document.getElementById('archCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const parent = canvas.parentElement;
    const width = parent.clientWidth;
    const height = parent.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(4.5, 4.0, 8.0);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x0052cc, 2.5, 20);
    pointLight.position.set(2, 5, 4);
    scene.add(pointLight);

    const stackGroup = new THREE.Group();
    scene.add(stackGroup);

    // 6 Layer Plates
    const layersData = [
      { name: "User Interface (HTML/CSS/JS)", color: 0x0052cc, y: 2.2 },
      { name: "Flask REST API", color: 0x0284c7, y: 1.3 },
      { name: "Multilingual NLP Service", color: 0x0369a1, y: 0.4 },
      { name: "Multilingual Embeddings", color: 0x7c3aed, y: -0.5 },
      { name: "FAISS Vector Search Engine", color: 0x0052cc, y: -1.4 },
      { name: "Standards Knowledge Base", color: 0x0284c7, y: -2.3 }
    ];

    const plates = [];
    layersData.forEach((layer) => {
      const geo = new THREE.BoxGeometry(3.6, 0.12, 2.4);
      const mat = new THREE.MeshStandardMaterial({
        color: layer.color,
        emissive: layer.color,
        emissiveIntensity: 0.35,
        transparent: true,
        opacity: 0.75,
        roughness: 0.3,
        metalness: 0.5
      });
      const plate = new THREE.Mesh(geo, mat);
      plate.position.set(0, layer.y, 0);
      plate.userData = { name: layer.name };
      stackGroup.add(plate);
      plates.push(plate);

      // Wireframe edge for sharp contrast on light background
      const edges = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.25 }));
      plate.add(line);
    });

    // Flowing Data Particles
    const pCount = 80;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pYDirs = [];

    for (let i = 0; i < pCount; i++) {
      const idx = i * 3;
      pPos[idx] = (Math.random() - 0.5) * 3.0;
      pPos[idx + 1] = -2.3 + Math.random() * 4.6;
      pPos[idx + 2] = (Math.random() - 0.5) * 1.8;
      pYDirs.push(Math.random() * 0.02 + 0.01);
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x0052cc, size: 0.08, transparent: true, opacity: 0.75 });
    const pSystem = new THREE.Points(pGeo, pMat);
    stackGroup.add(pSystem);

    let isVisible = true;
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    });
    observer.observe(parent);

    const animate = () => {
      requestAnimationFrame(animate);
      if (!isVisible) return;

      stackGroup.rotation.y += 0.005;

      const positions = pGeo.attributes.position.array;
      for (let i = 0; i < pCount; i++) {
        const idx = i * 3 + 1;
        positions[idx] += pYDirs[i];
        if (positions[idx] > 2.5) {
          positions[idx] = -2.5;
        }
      }
      pGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();
  },

  // =========================================================================
  // 4. RELATED STANDARDS 3D CONSTELLATION SCENE (MODAL)
  // =========================================================================
  relatedApp: null,

  initRelatedModalScene(primaryStandard, relatedStandards = []) {
    const canvas = document.getElementById('relatedCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const parent = canvas.parentElement;
    const width = parent.clientWidth;
    const height = parent.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const pLight = new THREE.PointLight(0x0052cc, 2.2, 20);
    pLight.position.set(0, 0, 5);
    scene.add(pLight);

    const group = new THREE.Group();
    scene.add(group);

    // Central Main Standard Node
    const centerGeo = new THREE.SphereGeometry(0.55, 24, 24);
    const centerMat = new THREE.MeshStandardMaterial({
      color: 0x0052cc,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5
    });
    const centerNode = new THREE.Mesh(centerGeo, centerMat);
    centerNode.userData = { title: primaryStandard.is_number, subtitle: primaryStandard.title, type: "PRIMARY STANDARD" };
    group.add(centerNode);

    const items = relatedStandards.length > 0 ? relatedStandards : [
      { category: "Safety Standard", is_number: "IS 302-1", title: "General Safety" },
      { category: "Testing Standard", is_number: "IS 9000", title: "Environmental Testing" },
      { category: "Installation Standard", is_number: "IS 732", title: "Wiring Practice" }
    ];

    const categoryColors = {
      "Safety Standard": 0x7c3aed,
      "Testing Standard": 0x0284c7,
      "Product Standard": 0x0052cc,
      "Installation Standard": 0x059669,
      "Related Product Standard": 0x2563eb
    };

    items.forEach((rel, idx) => {
      const angle = (idx / items.length) * Math.PI * 2;
      const dist = 2.4;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;

      const col = categoryColors[rel.category] || 0x0052cc;
      const rGeo = new THREE.BoxGeometry(0.48, 0.58, 0.12);
      const rMat = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.4 });
      const rNode = new THREE.Mesh(rGeo, rMat);
      rNode.position.set(x, y, 0);
      rNode.userData = { title: rel.is_number, subtitle: rel.title, type: rel.category };
      group.add(rNode);

      const lineMat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.45 });
      const lineGeo = new THREE.BufferGeometry().setFromPoints([centerNode.position, rNode.position]);
      group.add(new THREE.Line(lineGeo, lineMat));
    });

    let animId = null;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      group.rotation.z += 0.003;
      group.rotation.x = Math.sin(group.rotation.z) * 0.2;
      renderer.render(scene, camera);
    };
    animate();

    this.relatedApp = {
      destroy: () => {
        cancelAnimationFrame(animId);
        renderer.dispose();
      }
    };
  },

  // =========================================================================
  // 5. CTA BACKGROUND SCENE (LIGHT THEME)
  // =========================================================================
  initCtaScene() {
    const canvas = document.getElementById('ctaCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const parent = canvas.parentElement;
    const width = parent.clientWidth;
    const height = parent.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 50);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particles = 180;
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particles * 3);

    for (let i = 0; i < particles * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 16;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 6;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0x0052cc,
      size: 0.09,
      transparent: true,
      opacity: 0.4
    });
    const pMesh = new THREE.Points(pGeo, pMat);
    scene.add(pMesh);

    let isVisible = true;
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    });
    observer.observe(parent);

    const animate = () => {
      requestAnimationFrame(animate);
      if (!isVisible) return;
      pMesh.rotation.y += 0.001;
      pMesh.rotation.x += 0.0005;
      renderer.render(scene, camera);
    };
    animate();
  }
};

window.BISENSE_3D = ThreeScenes;

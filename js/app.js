const mockData = window.mockData || {};

// Application State Controller
class EventlyApp {
  constructor() {
    this.state = {
      activeEvent: mockData.events.find(e => e.id === mockData.activeEventId) || mockData.events[0],
      events: [...mockData.events],
      guests: [...mockData.guests],
      tables: [...mockData.tables],
      vendors: [...mockData.vendors],
      tasks: [...mockData.tasks],
      timeline: [...mockData.timeline],
      currentView: 'view-dashboard',
      sidebarCollapsed: false
    };

    this.init();
  }

  init() {
    this.bindEvents();
    this.renderCurrentEventHeader();
    this.renderEventsList();
    this.renderGuestsTable();
    this.renderTablesLayout();
    this.renderVendorsTable();
    this.renderTasksBoard();
    this.renderTimeline();
  }

  // Bind UI Events
  bindEvents() {
    // Navigation Tabs
    document.querySelectorAll('.nav-item-btn[data-view]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetView = btn.getAttribute('data-view');
        this.switchView(targetView);
      });
    });

    // Sidebar Toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        this.state.sidebarCollapsed = !this.state.sidebarCollapsed;
        sidebar.classList.toggle('collapsed', this.state.sidebarCollapsed);
      });
    }

    // Logo Click -> Dashboard
    const logoBtn = document.getElementById('brand-logo-btn');
    if (logoBtn) {
      logoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchView('view-dashboard');
      });
    }

    // Event Day Mode Open / Close
    const triggerDayMode = document.getElementById('trigger-day-mode-btn');
    const navDayMode = document.getElementById('open-day-mode-nav');
    const exitDayMode = document.getElementById('exit-day-mode-btn');
    const dayModeOverlay = document.getElementById('event-day-overlay');

    const openDayMode = () => {
      dayModeOverlay.classList.add('active');
      this.showToast("⚡ Modo Event-Day activado para operación de campo");
    };

    const closeDayMode = () => {
      dayModeOverlay.classList.remove('active');
    };

    if (triggerDayMode) triggerDayMode.addEventListener('click', openDayMode);
    if (navDayMode) navDayMode.addEventListener('click', openDayMode);
    if (exitDayMode) exitDayMode.addEventListener('click', closeDayMode);

    // Day Mode Big Action Buttons
    const dayScanBtn = document.getElementById('day-action-scan');
    if (dayScanBtn) {
      dayScanBtn.addEventListener('click', () => {
        closeDayMode();
        this.switchView('view-access-control');
      });
    }

    const dayGuestsBtn = document.getElementById('day-action-guests');
    if (dayGuestsBtn) {
      dayGuestsBtn.addEventListener('click', () => {
        closeDayMode();
        this.switchView('view-guests');
      });
    }

    const daySeatingBtn = document.getElementById('day-action-seating');
    if (daySeatingBtn) {
      daySeatingBtn.addEventListener('click', () => {
        closeDayMode();
        this.switchView('view-seating');
      });
    }

    const dayTimelineBtn = document.getElementById('day-action-timeline');
    if (dayTimelineBtn) {
      dayTimelineBtn.addEventListener('click', () => {
        closeDayMode();
        this.switchView('view-timeline');
      });
    }

    const dayAiReceptionBtn = document.getElementById('day-action-ai-reception');
    if (dayAiReceptionBtn) {
      dayAiReceptionBtn.addEventListener('click', () => {
        closeDayMode();
        this.switchView('view-seating');
        const iframe = document.getElementById('smart-control-iframe');
        if (iframe) {
          iframe.src = './smart-guest-control/dist/index.html#/reception';
        }
      });
    }

    // Smart Guest Control Route Switcher & Full Screen Tab
    const smartIframe = document.getElementById('smart-control-iframe');
    const smartRouteButtons = document.querySelectorAll('[data-smart-route]');
    smartRouteButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        smartRouteButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const route = btn.getAttribute('data-smart-route');
        if (smartIframe) {
          smartIframe.src = `./smart-guest-control/dist/index.html${route}`;
        }
      });
    });

    const openSmartTabBtn = document.getElementById('btn-smart-open-tab');
    if (openSmartTabBtn) {
      openSmartTabBtn.addEventListener('click', () => {
        window.open('./smart-guest-control/dist/index.html#/admin/dashboard', '_blank');
      });
    }

    // Direct Navigation from Seating Plan to Smart TableMap
    const openTableMap = () => {
      this.switchView('view-seating');
      if (smartIframe) {
        smartIframe.src = './smart-guest-control/dist/index.html#/admin/tables';
      }
      smartRouteButtons.forEach(b => {
        if (b.getAttribute('data-smart-route') === '#/admin/tables') b.classList.add('active');
        else b.classList.remove('active');
      });
      this.showToast("🗺️ Abriendo Mapa de Mesas Interactivo (Smart Guest Control)");
    };

    const openSmartSeatingAI = () => {
      this.switchView('view-seating');
      if (smartIframe) {
        smartIframe.src = './smart-guest-control/dist/index.html#/admin/smart-seating';
      }
      smartRouteButtons.forEach(b => {
        if (b.getAttribute('data-smart-route') === '#/admin/smart-seating') b.classList.add('active');
        else b.classList.remove('active');
      });
      this.showToast("✨ Abriendo Smart Seating Optimizer (IA)");
    };

    // Seating Plan Mode Switcher (Interactive vs Summary)
    const chipInteractive = document.getElementById('chip-seating-interactive');
    const chipSummary = document.getElementById('chip-seating-summary');
    const containerInteractive = document.getElementById('seating-interactive-container');
    const containerSummary = document.getElementById('venue-layout-container');
    const btnSeatingFullscreen = document.getElementById('btn-open-seating-fullscreen');

    if (chipInteractive && chipSummary && containerInteractive && containerSummary) {
      chipInteractive.addEventListener('click', () => {
        chipInteractive.classList.add('active');
        chipSummary.classList.remove('active');
        containerInteractive.style.display = 'block';
        containerSummary.style.display = 'none';
      });

      chipSummary.addEventListener('click', () => {
        chipSummary.classList.add('active');
        chipInteractive.classList.remove('active');
        containerInteractive.style.display = 'none';
        containerSummary.style.display = 'flex';
      });
    }

    if (btnSeatingFullscreen) {
      btnSeatingFullscreen.addEventListener('click', () => {
        window.open('./smart-guest-control/dist/index.html#/admin/tables', '_blank');
      });
    }

    // Guest Drawer Close
    const closeDrawerBtn = document.getElementById('close-guest-drawer-btn');
    const drawerBackdrop = document.getElementById('guest-drawer-backdrop');
    if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', () => this.closeGuestDrawer());
    if (drawerBackdrop) drawerBackdrop.addEventListener('click', () => this.closeGuestDrawer());

    // Create Event Wizard Modal
    const openWizardBtn = document.getElementById('btn-open-create-wizard');
    const closeWizardBtn = document.getElementById('close-event-modal-btn');
    const cancelWizardBtn = document.getElementById('cancel-event-modal-btn');
    const saveWizardBtn = document.getElementById('save-new-event-btn');
    const eventModal = document.getElementById('create-event-modal');

    if (openWizardBtn && eventModal) {
      openWizardBtn.addEventListener('click', () => eventModal.classList.add('open'));
    }
    if (closeWizardBtn && eventModal) {
      closeWizardBtn.addEventListener('click', () => eventModal.classList.remove('open'));
    }
    if (cancelWizardBtn && eventModal) {
      cancelWizardBtn.addEventListener('click', () => eventModal.classList.remove('open'));
    }
    if (saveWizardBtn && eventModal) {
      saveWizardBtn.addEventListener('click', () => {
        const nameInput = document.getElementById('wizard-event-name');
        const typeSelect = document.getElementById('wizard-event-type');
        const newEventName = nameInput.value.trim() || 'Nuevo Evento 2026';

        const newEvent = {
          id: `evt-${Date.now()}`,
          name: newEventName,
          type: typeSelect ? typeSelect.value : 'Social',
          date: '15 NOV 2026',
          time: '7:00 PM',
          location: 'Centro de Eventos',
          totalGuests: 350,
          confirmed: 0,
          checkedIn: 0,
          pending: 350,
          declined: 0,
          vendorsCount: 6,
          budgetTotal: 300000,
          budgetSpent: 45000,
          planner: 'Sergio (Admin)',
          status: 'UPCOMING',
          coverColor: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)',
          badge: 'Draft'
        };

        this.state.events.unshift(newEvent);
        this.renderEventsList();
        eventModal.classList.remove('open');
        this.showToast(`✓ Evento "${newEventName}" creado en estado borrador`);
        nameInput.value = '';
      });
    }

    // Quick check-in from Dashboard Hero
    const quickCheckinBtn = document.getElementById('btn-quick-checkin');
    if (quickCheckinBtn) {
      quickCheckinBtn.addEventListener('click', () => this.switchView('view-access-control'));
    }

    // QR Scan Simulation in Access Control
    const simulateScanBtn = document.getElementById('btn-simulate-scan');
    const confirmCheckinBtn = document.getElementById('btn-confirm-checkin-action');
    if (simulateScanBtn) {
      simulateScanBtn.addEventListener('click', () => {
        this.showToast("🔍 Escaneando código QR de Juan Pérez...");
        const resultBox = document.getElementById('scan-result-box');
        if (resultBox) {
          resultBox.style.boxShadow = "0 0 25px rgba(56, 189, 248, 0.6)";
          setTimeout(() => {
            resultBox.style.boxShadow = "none";
            this.playAudio('assets/music/checkin_beep_success.wav');
            this.showToast("✓ ACCESO APROBADO: Juan Pérez (Mesa 18)");
          }, 400);
        }
      });
    }

    if (confirmCheckinBtn) {
      confirmCheckinBtn.addEventListener('click', () => {
        this.state.activeEvent.checkedIn += 1;
        document.getElementById('day-checkedin-count').textContent = `${this.state.activeEvent.checkedIn} / ${this.state.activeEvent.confirmed}`;
        this.playAudio('assets/music/vip_arrival_fanfare.wav');
        this.showToast(`✓ Entrada registrada: Juan Pérez y acompañantes acreditados.`);
      });
    }

    // Assets Vault Modal Handlers
    const btnAssetsVault = document.getElementById('btn-assets-vault');
    const modalAssetsVault = document.getElementById('modal-assets-vault');
    const btnCloseAssetsModal = document.getElementById('btn-close-assets-modal');
    if (btnAssetsVault && modalAssetsVault) {
      btnAssetsVault.addEventListener('click', () => {
        modalAssetsVault.style.display = 'flex';
      });
    }

    const btnHeroWatchIntro = document.getElementById('btn-hero-watch-intro');
    if (btnHeroWatchIntro && modalAssetsVault) {
      btnHeroWatchIntro.addEventListener('click', () => {
        modalAssetsVault.style.display = 'flex';
        // Select video tab
        const videoTabBtn = document.querySelector('[data-asset-tab="tab-vault-video"]');
        if (videoTabBtn) videoTabBtn.click();
        const introVideo = document.getElementById('vault-video-intro');
        if (introVideo) {
          introVideo.currentTime = 0;
          introVideo.play().catch(e => console.log('Video play policy:', e));
        }
      });
    }

    // Background Lounge Music Toggle
    const btnAmbientMusic = document.getElementById('btn-ambient-music-toggle');
    let bgmAudio = null;
    let isBgmPlaying = false;

    if (btnAmbientMusic) {
      btnAmbientMusic.addEventListener('click', () => {
        if (!bgmAudio) {
          bgmAudio = new Audio('assets/music/event_lounge_ambient.wav');
          bgmAudio.loop = true;
          bgmAudio.volume = 0.4;
        }

        if (isBgmPlaying) {
          bgmAudio.pause();
          isBgmPlaying = false;
          btnAmbientMusic.style.background = 'rgba(236, 72, 153, 0.08)';
          btnAmbientMusic.style.borderColor = 'rgba(236, 72, 153, 0.3)';
          this.showToast('⏸️ Música ambiental en pausa');
        } else {
          bgmAudio.play().then(() => {
            isBgmPlaying = true;
            btnAmbientMusic.style.background = 'rgba(236, 72, 153, 0.3)';
            btnAmbientMusic.style.borderColor = '#ec4899';
            this.showToast('🎶 Reproduciendo música ambiental Lounge (Stereo)');
          }).catch(err => {
            console.warn('Audio play blocked:', err);
            this.showToast('⚠️ Reproducción de audio bloqueada por el navegador');
          });
        }
      });
    }

    if (btnCloseAssetsModal && modalAssetsVault) {
      btnCloseAssetsModal.addEventListener('click', () => {
        modalAssetsVault.style.display = 'none';
        // Pause any playing videos or audios inside modal
        modalAssetsVault.querySelectorAll('video, audio').forEach(media => media.pause());
      });
    }

    // Assets Vault Tabs
    document.querySelectorAll('[data-asset-tab]').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        document.querySelectorAll('[data-asset-tab]').forEach(b => {
          b.classList.remove('active');
          b.style.background = 'transparent';
          b.style.color = 'var(--text-secondary)';
        });
        tabBtn.classList.add('active');
        tabBtn.style.background = 'rgba(99, 102, 241, 0.2)';
        tabBtn.style.color = '#818cf8';

        const targetId = tabBtn.getAttribute('data-asset-tab');
        document.querySelectorAll('.vault-tab-pane').forEach(pane => pane.style.display = 'none');
        const activePane = document.getElementById(targetId);
        if (activePane) activePane.style.display = 'block';
      });
    });

    // Test Audio SFX Buttons
    const btnTestBeep = document.getElementById('btn-test-beep-sfx');
    const btnTestVip = document.getElementById('btn-test-vip-sfx');
    if (btnTestBeep) {
      btnTestBeep.addEventListener('click', () => {
        this.playAudio('assets/music/checkin_beep_success.wav');
        this.showToast('🔊 Sonido reproducido: checkin_beep_success.wav');
      });
    }
    if (btnTestVip) {
      btnTestVip.addEventListener('click', () => {
        this.playAudio('assets/music/vip_arrival_fanfare.wav');
        this.showToast('✨ Sonido reproducido: vip_arrival_fanfare.wav');
      });
    }

    // Smart Seating Simulation
    const smartArrangeBtn = document.getElementById('btn-smart-arrange');
    if (smartArrangeBtn) {
      smartArrangeBtn.addEventListener('click', () => {
        this.showToast("✨ Optimizando distribución de mesas por compatibilidad...");
        setTimeout(() => {
          this.showToast("✓ Smart Seating: 387 invitados acomodados sin conflictos de aforo.");
        }, 600);
      });
    }

    // Guest search input
    const guestSearch = document.getElementById('guest-table-search');
    if (guestSearch) {
      guestSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        this.renderGuestsTable(query);
      });
    }

    // Global search input
    const globalSearch = document.getElementById('global-search-input');
    if (globalSearch) {
      globalSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = globalSearch.value.trim();
          if (val) {
            this.switchView('view-guests');
            const tableSearch = document.getElementById('guest-table-search');
            if (tableSearch) {
              tableSearch.value = val;
              this.renderGuestsTable(val.toLowerCase());
            }
            this.showToast(`Resultados de búsqueda global para: "${val}"`);
          }
        }
      });
    }
  }

  // Navigation View Switcher
  switchView(viewId) {
    if (viewId === 'view-smart-control') {
      viewId = 'view-seating';
    }
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    const targetSection = document.getElementById(viewId);
    if (targetSection) {
      targetSection.classList.add('active');
      this.state.currentView = viewId;
    }

    // Update active nav button
    document.querySelectorAll('.nav-item-btn').forEach(btn => {
      if (btn.getAttribute('data-view') === viewId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Scroll to top
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.scrollTop = 0;
  }

  renderCurrentEventHeader() {
    const titleElem = document.getElementById('current-event-title');
    const heroTitle = document.getElementById('dash-event-title');
    const dayModeTitle = document.getElementById('day-mode-title');
    if (titleElem) titleElem.textContent = this.state.activeEvent.name;
    if (heroTitle) heroTitle.textContent = this.state.activeEvent.name;
    if (dayModeTitle) dayModeTitle.textContent = this.state.activeEvent.name;
  }

  // Render My Events Cards
  renderEventsList() {
    const grid = document.getElementById('events-list-grid');
    if (!grid) return;

    grid.innerHTML = this.state.events.map(event => {
      const percent = Math.round((event.confirmed / event.totalGuests) * 100) || 0;
      return `
        <div class="event-item-card" data-event-id="${event.id}">
          <div class="event-card-cover" style="background: ${event.coverImage ? `linear-gradient(180deg, rgba(15,23,42,0.3) 0%, rgba(15,23,42,0.88) 100%), url('${event.coverImage}') center/cover no-repeat` : event.coverColor};">
            <span class="event-badge">${event.status}</span>
            <span style="color: #fff; font-size: 0.75rem; font-weight: 600;">Planner: ${event.planner}</span>
          </div>
          <div class="event-card-body">
            <h3 class="event-card-title">${event.name}</h3>
            <div class="event-card-meta">
              <span>📅 ${event.date} · ${event.time}</span>
              <span>📍 ${event.location}</span>
            </div>
            <div class="event-card-progress">
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                <span style="color: var(--text-secondary);">${event.confirmed} / ${event.totalGuests} confirmados</span>
                <span style="font-weight: 700; color: #fff;">${percent}%</span>
              </div>
              <div style="height: 6px; background: var(--bg-surface-elevated); border-radius: var(--radius-full); overflow: hidden;">
                <div style="width: ${percent}%; height: 100%; background: var(--accent-gradient);"></div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Click on event card to select it
    grid.querySelectorAll('.event-item-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-event-id');
        const selected = this.state.events.find(e => e.id === id);
        if (selected) {
          this.state.activeEvent = selected;
          this.renderCurrentEventHeader();
          this.switchView('view-dashboard');
          this.showToast(`Cambiado al evento activo: ${selected.name}`);
        }
      });
    });
  }

  // Render Guests Table
  renderGuestsTable(filterQuery = '') {
    const tbody = document.getElementById('guests-table-body');
    if (!tbody) return;

    const filtered = this.state.guests.filter(g => {
      if (!filterQuery) return true;
      return g.name.toLowerCase().includes(filterQuery) ||
             g.group.toLowerCase().includes(filterQuery) ||
             g.id.toLowerCase().includes(filterQuery);
    });

    tbody.innerHTML = filtered.map(guest => `
      <tr data-guest-id="${guest.id}">
        <td>
          <div class="guest-name-cell">
            <div class="user-avatar" style="width: 28px; height: 28px; font-size: 0.75rem;">${guest.name.charAt(0)}</div>
            <span>${guest.name}</span>
          </div>
        </td>
        <td><code style="color: var(--text-muted); font-size: 0.8rem;">${guest.id}</code></td>
        <td>${guest.group}</td>
        <td><strong>${guest.partySize}</strong> pax</td>
        <td>
          <span class="badge-tag ${guest.status === 'Confirmed' ? 'badge-confirmed' : guest.status === 'Pending' ? 'badge-pending' : 'badge-declined'}">
            ${guest.status}
          </span>
        </td>
        <td>${guest.table}</td>
        <td>${guest.seat}</td>
        <td><span class="badge-tag badge-qr-active">${guest.qrStatus}</span></td>
        <td>
          ${guest.checkedIn 
            ? `<span class="badge-tag badge-confirmed">✓ In (${guest.checkInTime})</span>` 
            : `<span style="color: var(--text-muted); font-size: 0.75rem;">Pendiente</span>`
          }
        </td>
      </tr>
    `).join('');

    // Row click -> Open Guest Detail Drawer
    tbody.querySelectorAll('tr').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.getAttribute('data-guest-id');
        const guest = this.state.guests.find(g => g.id === id);
        if (guest) this.openGuestDrawer(guest);
      });
    });
  }

  // Open Guest Detail Drawer
  openGuestDrawer(guest) {
    const drawer = document.getElementById('guest-drawer');
    const backdrop = document.getElementById('guest-drawer-backdrop');
    const content = document.getElementById('guest-drawer-content');
    const nameElem = document.getElementById('drawer-guest-name');
    const idElem = document.getElementById('drawer-guest-id');

    if (!drawer || !backdrop || !content) return;

    nameElem.textContent = guest.name;
    idElem.textContent = guest.id;

    content.innerHTML = `
      <div style="background: var(--bg-surface-elevated); padding: 1.25rem; border-radius: var(--radius-sm); margin-bottom: 1.5rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.85rem;">
          <div>
            <span style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase;">Grupo / Familia</span>
            <div style="font-weight: 600; color: #fff;">${guest.group}</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase;">Relación</span>
            <div style="font-weight: 600; color: #fff;">${guest.relationship}</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase;">Acompañantes</span>
            <div style="font-weight: 600; color: #fff;">${guest.partySize} Personas</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase;">RSVP</span>
            <div><span class="badge-tag badge-confirmed">${guest.status}</span></div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase;">Mesa Asignada</span>
            <div style="font-weight: 700; color: var(--accent-primary);">${guest.table}</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase;">Asientos</span>
            <div style="font-weight: 600; color: #fff;">${guest.seat}</div>
          </div>
        </div>
      </div>

      <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; margin-bottom: 0.75rem;">
        Lifecycle & Timeline de Accesos
      </h4>

      <div class="timeline-vertical">
        ${guest.timeline.map(step => `
          <div class="timeline-step">
            <div class="step-node ${step.completed ? 'active' : ''}"></div>
            <div class="step-content">
              <h5>${step.label}</h5>
              <p>${step.date}</p>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="margin-top: 1.5rem; display: flex; gap: 0.75rem;">
        <button class="btn-primary" style="flex: 1; justify-content: center;" onclick="app.simulateCheckinFromDrawer('${guest.id}')">
          Acreditar Acceso QR
        </button>
      </div>
    `;

    drawer.classList.add('open');
    backdrop.classList.add('open');
  }

  simulateCheckinFromDrawer(guestId) {
    const guest = this.state.guests.find(g => g.id === guestId);
    if (guest) {
      guest.checkedIn = true;
      guest.checkInTime = "7:50 PM";
      this.renderGuestsTable();
      this.closeGuestDrawer();
      this.showToast(`✓ Invitado ${guest.name} acreditado exitosamente.`);
    }
  }

  closeGuestDrawer() {
    const drawer = document.getElementById('guest-drawer');
    const backdrop = document.getElementById('guest-drawer-backdrop');
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
  }

  // Render Seating Layout
  renderTablesLayout() {
    const container = document.getElementById('tables-render-grid');
    if (!container) return;

    container.innerHTML = this.state.tables.map(table => {
      const isFull = table.assigned >= table.capacity;
      return `
        <div class="visual-table ${table.type === 'Rectangle' || table.type === 'Imperial' ? 'rectangle' : ''}" 
             style="${isFull ? 'border-color: rgba(16, 185, 129, 0.4);' : ''}"
             title="${table.name} (${table.assigned}/${table.capacity})">
          <span class="table-name">${table.name}</span>
          <span class="table-capacity" style="color: ${isFull ? 'var(--success)' : 'var(--text-muted)'};">
            ${table.assigned} / ${table.capacity}
          </span>
        </div>
      `;
    }).join('');

    // Click on table shows quick summary
    container.querySelectorAll('.visual-table').forEach((el, index) => {
      el.addEventListener('click', () => {
        const table = this.state.tables[index];
        this.showToast(`Mesa: ${table.name} · Capacidad: ${table.assigned}/${table.capacity} · Zona: ${table.zone}`);
      });
    });
  }

  // Render Vendors Table
  renderVendorsTable() {
    const tbody = document.getElementById('vendors-table-body');
    if (!tbody) return;

    tbody.innerHTML = this.state.vendors.map(v => `
      <tr>
        <td style="font-weight: 600; color: #fff;">${v.name}</td>
        <td><span class="badge-tag" style="background: var(--bg-surface-elevated);">${v.category}</span></td>
        <td>${v.contact} (${v.phone})</td>
        <td>
          <span class="badge-tag ${v.status === 'Confirmed' ? 'badge-confirmed' : v.status === 'Pending' ? 'badge-pending' : 'badge-declined'}">
            ${v.status}
          </span>
        </td>
        <td>${v.arrival}</td>
        <td>${v.setup}</td>
        <td>$${v.cost.toLocaleString()}</td>
        <td style="color: var(--success);">$${v.paid.toLocaleString()}</td>
        <td style="font-weight: 700; color: ${v.balance > 0 ? 'var(--warning)' : 'var(--text-muted)'};">
          $${v.balance.toLocaleString()}
        </td>
      </tr>
    `).join('');
  }

  // Render Tasks Board
  renderTasksBoard() {
    const container = document.getElementById('tasks-board-grid');
    if (!container) return;

    container.innerHTML = this.state.tasks.map(t => `
      <div class="card-panel" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span class="badge-tag ${t.priority === 'HIGH' ? 'badge-declined' : 'badge-pending'}">${t.priority}</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${t.category}</span>
          </div>
          <h4 style="font-size: 0.95rem; font-weight: 700; color: #fff; margin-bottom: 0.4rem;">${t.title}</h4>
          <div style="font-size: 0.78rem; color: var(--text-secondary);">Asignado: ${t.assignee}</div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; border-top: 1px solid var(--border-subtle); padding-top: 0.6rem;">
          <span style="font-size: 0.75rem; color: var(--text-muted);">Vence: ${t.dueDate}</span>
          <span class="badge-tag ${t.status === 'COMPLETED' ? 'badge-confirmed' : 'badge-pending'}">${t.status}</span>
        </div>
      </div>
    `).join('');
  }

  // Render Minute by Minute Timeline
  renderTimeline() {
    const container = document.getElementById('event-timeline-list');
    if (!container) return;

    container.innerHTML = this.state.timeline.map(t => `
      <div class="timeline-step">
        <div class="step-node ${t.status === 'completed' || t.status === 'current' ? 'active' : ''}"></div>
        <div class="step-content">
          <span style="font-size: 0.75rem; font-weight: 800; color: ${t.status === 'current' ? 'var(--success)' : '#93c5fd'};">
            ${t.time} ${t.status === 'current' ? '· EN VIVO' : ''}
          </span>
          <h5>${t.title}</h5>
          <p>${t.desc}</p>
        </div>
      </div>
    `).join('');
  }

  // Audio Sound FX Utility
  playAudio(src) {
    try {
      const audio = new Audio(src);
      audio.volume = 0.55;
      audio.play().catch(err => {
        console.warn('Reproducción de audio bloqueada por política del navegador:', err);
      });
    } catch (e) {
      console.error('Error al instanciar audio:', e);
    }
  }

  // Toast Notification Utility
  showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

// Instantiate App
window.app = new EventlyApp();

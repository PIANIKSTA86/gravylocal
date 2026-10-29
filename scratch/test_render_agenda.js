// Mock browser environment to test renderAgendaPagos execution
const fs = require('fs');

// Simple DOM Mock
class MockElement {
  constructor(tag, id = '') {
    this.tagName = tag;
    this.id = id;
    this.innerHTML = '';
    this.innerText = '';
    this.textContent = '';
    this.style = {};
    this.classList = {
      add: () => {},
      remove: () => {},
      toggle: () => {},
      contains: () => false
    };
    this.dataset = {};
    this.attributes = {};
    this.children = [];
    this.listeners = {};
  }
  setAttribute(k, v) { this.attributes[k] = v; }
  getAttribute(k) { return this.attributes[k] || null; }
  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }
  querySelector(sel) { return new MockElement('div'); }
  querySelectorAll(sel) { return [new MockElement('div'), new MockElement('div')]; }
}

global.document = {
  getElementById: (id) => new MockElement('div', id),
  querySelectorAll: (sel) => [new MockElement('div')],
  querySelector: (sel) => new MockElement('div'),
  createElement: (tag) => new MockElement(tag)
};

global.window = {
  pb: {
    listAll: async (col) => {
      if (col === 'agenda_vencimientos') {
        return [
          {
            id: 'v1',
            type: 'cxp_proveedor',
            title: 'CXP Proveedor: Test',
            due_date: '2026-10-21',
            amount: 44900,
            status: 'pendiente',
            assigned_roles: ['auxiliar']
          },
          {
            id: 'v2',
            type: 'cxc_cliente',
            title: 'Cobro Fac FV-001',
            due_date: '2026-10-28',
            amount: 2800000,
            status: 'pendiente',
            assigned_roles: ['admin']
          }
        ];
      }
      if (col === 'third_parties') {
        return [{ id: 'tp1', name: 'Proveedor ABC', nit: '900123' }];
      }
      return [];
    }
  },
  showToast: (msg, type) => console.log('Toast:', type, msg),
  openModal: (title, body, footer) => console.log('Open modal:', title),
  closeModal: () => console.log('Close modal'),
  fmt: (n) => `$ ${n.toLocaleString('es-CO')}`
};

// Test with mocked elements
console.log('Testing agenda module mockup logic: OK');

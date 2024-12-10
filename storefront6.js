/**
 * GameShift Storefront SDK v1.0.4
 * https://gameshift.dev
 */
!(function (e) {
  'use strict';
  function __awaiter(e, t, o, s) {
    return new (o || (o = Promise))(function (n, i) {
      function fulfilled(e) {
        try {
          step(s.next(e));
        } catch (e) {
          i(e);
        }
      }
      function rejected(e) {
        try {
          step(s.throw(e));
        } catch (e) {
          i(e);
        }
      }
      function step(e) {
        var t;
        e.done
          ? n(e.value)
          : ((t = e.value),
            t instanceof o
              ? t
              : new o(function (e) {
                  e(t);
                })).then(fulfilled, rejected);
      }
      step((s = s.apply(e, t || [])).next());
    });
  }
  function animateModalOut(e, t, o) {
    (e.style.opacity = '0'),
      t && (t.style.transform = 'scale(0.95)'),
      o &&
        ((o.style.transform = 'scale(0.8) rotate(180deg)'),
        (o.style.opacity = '0'));
  }
  'function' == typeof SuppressedError && SuppressedError;
  const t = !0,
    o = { api: 'http://localhost:3000', frontend: 'http://localhost:8080' },
    s = {
      api: 'https://api.gameshift.dev',
      frontend: 'https://app.gameshift.dev',
    };
  function getUrls(e = !1) {
    return { api: e ? o.api : s.api, frontend: e ? o.frontend : s.frontend };
  }
  var n;
  (e.Environment = void 0),
    ((n = e.Environment || (e.Environment = {})).Development = 'Development'),
    (n.Production = 'Production');
  class Storefront {
    constructor(e) {
      (this.skipCloseConfirmation = !1),
        (this.isApiKeyValid = !1),
        (this.isConfirmationDialogOpen = !1),
        console.log('create config', e),
        (this.config = Object.assign(Object.assign({}, e), {
          popup: void 0 === e.popup || e.popup,
        }));
    }
    validateApiKey() {
      return __awaiter(this, void 0, void 0, function* () {
        const { api: e } = getUrls(t);
        console.log('validateApiKey', this.config);
        const o = yield fetch(
          `${e}/internal/validator/validate-storefront-api-key`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apiKey: this.config.apiKey,
              environment: this.config.environment,
            }),
          },
        );
        if (!o.ok)
          throw (
            ((this.isApiKeyValid = !1),
            new Error(`API validation failed with status ${o.status}`))
          );
        const s = yield o.json();
        if ((console.log('validateApiKey result', s), !s.isValid))
          throw (
            (console.error('validateApiKey error', s.error),
            (this.isApiKeyValid = !1),
            new Error(s.error || 'Invalid API key'))
          );
        this.isApiKeyValid = !0;
      });
    }
    listSkus(e) {
      return __awaiter(this, void 0, void 0, function* () {
        return (function (e, o, s, n) {
          return __awaiter(this, void 0, void 0, function* () {
            const i = new URLSearchParams();
            o && i.append('page', o.toString()),
              s && i.append('perPage', s.toString()),
              (null == n ? void 0 : n.priceLessThan) &&
                i.append('priceLessThan', n.priceLessThan),
              (null == n ? void 0 : n.priceGreaterThan) &&
                i.append('priceGreaterThan', n.priceGreaterThan),
              (null == n ? void 0 : n.nameContains) &&
                i.append('nameContains', n.nameContains),
              (null == n ? void 0 : n.type) && i.append('type', n.type),
              (null == n ? void 0 : n.collectionId) &&
                i.append('collectionId', n.collectionId);
            const { api: r } = getUrls(t),
              a = yield fetch(
                `${r}/internal/storefront/skus-with-inventory?${i.toString()}`,
                {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': e,
                  },
                },
              );
            return a.ok
              ? { success: !0, data: yield a.json() }
              : { success: !1, error: 'Failed to fetch SKUs' };
          });
        })(
          this.config.apiKey,
          null == e ? void 0 : e.page,
          null == e ? void 0 : e.perPage,
          e,
        );
      });
    }
    getSku(e) {
      return __awaiter(this, void 0, void 0, function* () {
        return (function (e, o) {
          return __awaiter(this, void 0, void 0, function* () {
            const { api: s } = getUrls(t),
              n = yield fetch(`${s}/nx/storefront/skus/${o}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'x-api-key': e },
              });
            return n.ok
              ? { success: !0, data: yield n.json() }
              : { success: !1, error: 'Failed to fetch SKU' };
          });
        })(this.config.apiKey, e);
      });
    }
    purchaseSkuImmediately(e) {
      return __awaiter(this, void 0, void 0, function* () {
        const { api: o } = getUrls(t),
          s = yield fetch(`${o}/internal/storefront/skus/${e.skuId}/purchase`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': this.config.apiKey,
            },
            body: JSON.stringify({
              quantity: e.quantity || 1,
              userReferenceId: e.userReferenceId,
              vendorData: e.vendorData,
            }),
          });
        if (!s.ok)
          return {
            success: !1,
            status: 'failed',
            error: 'Failed to create cart and purchase SKU',
          };
        const n = yield s.json();
        console.log('responseJson', n);
        const i = yield this.renderIframe(n.consentUrl);
        return i.success
          ? {
              success: !0,
              data: {
                skuId: e.skuId,
                quantity: e.quantity || 1,
                transactionId: n.id,
              },
            }
          : {
              success: !1,
              status: 'failed',
              error:
                (null == i ? void 0 : i.error) ||
                'Purchase was cancelled or failed',
            };
      });
    }
    renderIframe(e) {
      return __awaiter(this, void 0, void 0, function* () {
        return new Promise((o, s) =>
          __awaiter(this, void 0, void 0, function* () {
            if (this.config.popup) {
              const s = 500,
                n = 700,
                i = (window.innerWidth - s) / 2,
                r = (window.innerHeight - n) / 2;
              window.opener = window;
              const a = window.open(
                e,
                'GameShift Checkout',
                `width=${s},height=${n},left=${i},top=${r}`,
              );
              if (!a)
                return void o({
                  success: !1,
                  error: 'Popup was blocked by browser',
                });
              const messageHandler = (e) => {
                var s;
                if (e.origin === `${getUrls(t).frontend}`)
                  try {
                    const t =
                      'string' == typeof e.data ? JSON.parse(e.data) : e.data;
                    ('PaymentComplete' === t.type ||
                      ('iframe-result' === t.type &&
                        'completed' ===
                          (null === (s = t.result) || void 0 === s
                            ? void 0
                            : s.status))) &&
                      (window.removeEventListener('message', messageHandler),
                      a.close(),
                      o({
                        success: !0,
                        status: 'completed',
                        data: 'PaymentComplete' === t.type ? t : t.result,
                      }));
                  } catch (e) {
                    console.error('Error processing message:', e);
                  }
              };
              window.addEventListener('message', messageHandler);
              const l = setInterval(() => {
                a.closed &&
                  (clearInterval(l),
                  window.removeEventListener('message', messageHandler),
                  o({
                    success: !1,
                    error: 'User closed the purchase window before completion',
                  }));
              }, 500);
            } else {
              const t = document.createElement('div');
              (t.style.position = 'fixed'),
                (t.style.top = '0'),
                (t.style.left = '0'),
                (t.style.width = '100%'),
                (t.style.height = '100%'),
                (t.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'),
                (t.style.zIndex = '9998'),
                document.body.appendChild(t);
              const s = this.createModal(),
                n = this.createIframe(e),
                i = this.createCloseButton(s, o);
              s.appendChild(n),
                s.appendChild(i),
                document.body.appendChild(s),
                (function (e, t, o) {
                  requestAnimationFrame(() => {
                    (e.style.backgroundColor = 'rgba(0,0,0,0.5)'),
                      (e.style.opacity = '1'),
                      (t.style.width = '80%'),
                      (t.style.height = '80%'),
                      o &&
                        ((o.style.opacity = '1'),
                        (o.style.transform = 'scale(1)'));
                  });
                })(s, n, i);
              const messageHandler = (e) => {
                var r;
                console.log('Received message:', e);
                try {
                  const a =
                    'string' == typeof e.data ? JSON.parse(e.data) : e.data;
                  'PaymentComplete' === a.type ||
                  ('iframe-result' === a.type &&
                    'completed' ===
                      (null === (r = a.result) || void 0 === r
                        ? void 0
                        : r.status))
                    ? (window.removeEventListener('message', messageHandler),
                      animateModalOut(s, n, i),
                      setTimeout(() => {
                        document.body.removeChild(s),
                          document.body.removeChild(t),
                          console.log('Resolving promise with success result'),
                          o({
                            success: !0,
                            status: 'completed',
                            data: 'PaymentComplete' === a.type ? a : a.result,
                          });
                      }, 300))
                    : console.log(
                        'Message did not match auto-close criteria:',
                        a,
                      );
                } catch (t) {
                  console.error('Error processing message:', t),
                    console.log('Raw message data:', e.data);
                }
              };
              window.addEventListener('message', messageHandler);
            }
          }),
        );
      });
    }
    createModal() {
      const e = document.createElement('div');
      return (
        (function (e) {
          (e.style.position = 'fixed'),
            (e.style.top = '0'),
            (e.style.left = '0'),
            (e.style.width = '100%'),
            (e.style.height = '100%'),
            (e.style.backgroundColor = 'rgba(0,0,0,0)'),
            (e.style.display = 'flex'),
            (e.style.alignItems = 'center'),
            (e.style.justifyContent = 'center'),
            (e.style.zIndex = '9999'),
            (e.style.opacity = '0'),
            (e.style.transition = 'all 0.3s ease-in-out'),
            (e.style.fontFamily = 'Inter, sans-serif');
        })(e),
        e.addEventListener('click', (t) => {
          t.target === e && this.closeModal(e);
        }),
        e
      );
    }
    createIframe(e) {
      const t = document.createElement('iframe');
      return (
        (function (e) {
          (e.style.width = '0'),
            (e.style.height = '0'),
            (e.style.border = '1px solid rgba(0,0,0,0.1)'),
            (e.style.borderRadius = '8px'),
            (e.style.transition = 'all 0.3s ease-in-out'),
            (e.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'),
            (e.src = 'https://gameshift.dev/');
        })(t),
        console.log('checkoutUrl', e),
        t.setAttribute('allow', 'payment *'),
        t.setAttribute('allowpaymentrequest', 'true'),
        t.setAttribute(
          'sandbox',
          'allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox',
        ),
        (t.src = e),
        (t.title = 'withdraw'),
        t
      );
    }
    createCloseButton(e, t) {
      const o = document.createElement('button');
      return (
        (function (e) {
          (e.innerHTML = '&times;'),
            (e.style.position = 'fixed'),
            (e.style.right = '20px'),
            (e.style.top = '20px'),
            (e.style.width = '40px'),
            (e.style.height = '40px'),
            (e.style.borderRadius = '50%'),
            (e.style.backgroundColor = 'white'),
            (e.style.border = 'none'),
            (e.style.fontSize = '24px'),
            (e.style.cursor = 'pointer'),
            (e.style.display = 'flex'),
            (e.style.alignItems = 'center'),
            (e.style.justifyContent = 'center'),
            (e.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'),
            (e.style.transition = 'all 0.2s ease-in-out'),
            (e.style.opacity = '0'),
            (e.style.transform = 'scale(0.8)'),
            (e.style.fontFamily = 'Inter, sans-serif'),
            (e.style.lineHeight = '0'),
            (e.style.paddingBottom = '11px');
        })(o),
        o.addEventListener('mouseover', () => {
          (o.style.transform = 'scale(1.1)'),
            (o.style.backgroundColor = '#f0f0f0');
        }),
        o.addEventListener('mouseout', () => {
          (o.style.transform = 'scale(1)'), (o.style.backgroundColor = 'white');
        }),
        o.addEventListener('click', () => this.closeModal(e, t)),
        o
      );
    }
    closeModal(e, t) {
      if (this.skipCloseConfirmation) {
        animateModalOut(e);
        const o = document.querySelector('div[style*="rgba(0, 0, 0, 0.5)"]');
        setTimeout(() => {
          document.body.removeChild(e),
            o && document.body.removeChild(o),
            t &&
              t({
                success: !1,
                error: 'User closed the purchase window before completion',
              });
        }, 300);
      } else this.isConfirmationDialogOpen || this.showConfirmationDialog(e, t);
    }
    showConfirmationDialog(e, t) {
      this.isConfirmationDialogOpen = !0;
      const o = document.createElement('div');
      (o.style.position = 'fixed'),
        (o.style.top = '0'),
        (o.style.left = '0'),
        (o.style.width = '100%'),
        (o.style.height = '100%'),
        (o.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'),
        (o.style.zIndex = '9999'),
        (o.style.pointerEvents = 'all'),
        e.appendChild(o);
      const s = document.createElement('div');
      !(function (e) {
        (e.style.position = 'fixed'),
          (e.style.top = '50%'),
          (e.style.left = '50%'),
          (e.style.transform = 'translate(-50%, -50%) scale(0.9)'),
          (e.style.backgroundColor = '#1a1a1a'),
          (e.style.padding = 'min(20px, 3vw)'),
          (e.style.borderRadius = '12px'),
          (e.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)'),
          (e.style.zIndex = '10000'),
          (e.style.textAlign = 'center'),
          (e.style.opacity = '0'),
          (e.style.transition = 'all 0.2s ease-out'),
          (e.style.width = 'min(90%, 360px)'),
          (e.style.maxHeight = '90vh'),
          (e.style.overflowY = 'auto'),
          (e.style.fontFamily = 'Inter, sans-serif'),
          (e.style.border = '1px solid rgba(255,255,255,0.1)'),
          (e.style.backdropFilter = 'blur(10px)');
      })(s),
        (s.style.zIndex = '10000');
      const n = document.createElement('p');
      !(function (e) {
        (e.textContent =
          'Are you sure you want to close this window? Your progress will be lost.'),
          (e.style.marginBottom = 'min(20px, 3vw)'),
          (e.style.fontSize = 'clamp(14px, 2.5vw, 15px)'),
          (e.style.lineHeight = '1.5'),
          (e.style.color = '#ffffff'),
          (e.style.fontFamily = 'Inter, sans-serif'),
          (e.style.fontWeight = '400');
      })(n);
      const i = document.createElement('div');
      !(function (e) {
        (e.style.display = 'flex'),
          (e.style.justifyContent = 'center'),
          (e.style.gap = 'min(12px, 2vw)'),
          (e.style.flexWrap = 'wrap'),
          (e.style.fontFamily = 'Inter, sans-serif');
      })(i);
      const r = this.createConfirmationButton(!0, () => {
          (s.style.opacity = '0'),
            (s.style.transform = 'translate(-50%, -50%) scale(0.9)'),
            setTimeout(() => {
              document.body.removeChild(s),
                e.removeChild(o),
                (this.isConfirmationDialogOpen = !1),
                (this.skipCloseConfirmation = !0),
                this.closeModal(e, t);
            }, 200);
        }),
        a = this.createConfirmationButton(!1, () => {
          (s.style.opacity = '0'),
            (s.style.transform = 'translate(-50%, -50%) scale(0.9)'),
            setTimeout(() => {
              document.body.removeChild(s),
                e.removeChild(o),
                (this.isConfirmationDialogOpen = !1);
            }, 200);
        });
      i.appendChild(a),
        i.appendChild(r),
        s.appendChild(n),
        s.appendChild(i),
        document.body.appendChild(s),
        requestAnimationFrame(() => {
          (s.style.opacity = '1'),
            (s.style.transform = 'translate(-50%, -50%) scale(1)');
        });
    }
    createConfirmationButton(e, t) {
      const o = document.createElement('button');
      return (
        (function (e, t) {
          (e.textContent = t ? 'Yes, close' : 'Cancel'),
            (e.style.padding = 'min(10px, 2vw) min(20px, 4vw)'),
            (e.style.backgroundColor = t ? '#dc2626' : '#27272a'),
            (e.style.color = 'white'),
            (e.style.border = '1px solid ' + (t ? '#ef4444' : '#3f3f46')),
            (e.style.borderRadius = '6px'),
            (e.style.cursor = 'pointer'),
            (e.style.fontSize = 'clamp(12px, 2.5vw, 14px)'),
            (e.style.fontWeight = '500'),
            (e.style.transition = 'all 0.2s ease'),
            (e.style.margin = '4px'),
            (e.style.fontFamily = 'Inter, sans-serif');
        })(o, e),
        o.addEventListener('mouseover', () => {
          (o.style.backgroundColor = e ? '#c82333' : '#5a6268'),
            (o.style.transform = 'translateY(-1px)');
        }),
        o.addEventListener('mouseout', () => {
          (o.style.backgroundColor = e ? '#dc3545' : '#6c757d'),
            (o.style.transform = 'translateY(0)');
        }),
        (o.onclick = t),
        o
      );
    }
  }
  (window.Storefront = Storefront),
    (window.Environment = e.Environment),
    (e.Storefront = Storefront),
    Object.defineProperty(e, '__esModule', { value: !0 });
})((this.Storefront = this.Storefront || {}));

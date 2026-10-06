/* ============================================================
   ОБЩИЙ СКРИПТ САЙТА «БЛАГОПОЛУЧНАЯ СОБАКА»
   Работает в связке с общим header (см. css/common.css):
   - кнопка «Контакты» (.header-contacts-btn) — ведёт на Google-форму;
     старый код модального окна формы сохранён ниже (закомментирован),
     его можно вернуть, если снова понадобится модалка вместо ссылки;
   - модалка «О проекте» (.about-project-btn -> .about-modal),
     подключается на любой странице, где есть эти элементы.
   ============================================================ */
(function () {
    'use strict';

    /* ---------- Мобильное меню ---------- */
    var navToggle = document.querySelector('.nav-toggle');
    var mainNav = document.querySelector('.main-nav');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', function () {
            var isOpen = mainNav.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        mainNav.addEventListener('click', function (e) {
            if (e.target.closest('a')) {
                mainNav.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('click', function (e) {
            if (!e.target.closest('.header-right')) {
                mainNav.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                mainNav.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* ---------- Модалка «О проекте» ---------- */
    var aboutBtn = document.querySelector('.about-project-btn');
    var aboutModal = document.querySelector('.about-modal');

    if (aboutBtn && aboutModal) {
        function openAboutModal() {
            aboutModal.classList.add('is-open');
            aboutModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function closeAboutModal() {
            aboutModal.classList.remove('is-open');
            aboutModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        aboutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            openAboutModal();
        });

        aboutModal.addEventListener('click', function (e) {
            if (e.target.closest('[data-about-close="1"]')) {
                closeAboutModal();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && aboutModal.classList.contains('is-open')) {
                closeAboutModal();
            }
        });
    }

    /* ---------- Старая модалка «Контакты» (не используется:
       кнопка «Контакты» теперь ссылка на Google-форму).
       При необходимости раскомментируйте и уберите href у кнопки.

    var contactsButton = document.querySelector('.header-contacts-btn');
    if (contactsButton) {
      var receiverEmail = 'i@msuedova.ru';
      var widgetStyle = document.createElement('style');
      widgetStyle.textContent = '.contacts-modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;padding:20px;z-index:2000}.contacts-modal.is-open{display:flex}.contacts-modal__backdrop{position:absolute;inset:0;background:rgba(0,0,0,.42)}.contacts-modal__dialog{position:relative;z-index:1;width:100%;max-width:460px;background:#fff;border-radius:18px;padding:24px;box-shadow:0 18px 46px rgba(0,0,0,.16)}.contacts-modal__title{margin:0 28px 14px 0;font-size:20px}.contacts-modal__close{position:absolute;top:10px;right:10px;border:0;background:transparent;font-size:26px;line-height:1;cursor:pointer}.contacts-form{display:flex;flex-direction:column;gap:10px}.contacts-form input,.contacts-form textarea{width:100%;border:1px solid #d7d7d7;border-radius:10px;padding:10px 12px;font-family:inherit;font-size:14px}.contacts-form textarea{min-height:90px;resize:vertical}.contacts-form button{margin-top:4px;border:0;border-radius:999px;padding:12px 18px;font-family:inherit;font-weight:700;cursor:pointer;background:#5D6855;color:#fff}';
      document.head.appendChild(widgetStyle);
      var modal = document.createElement('div');
      modal.className = 'contacts-modal';
      modal.setAttribute('aria-hidden', 'true');
      modal.innerHTML = '<div class="contacts-modal__backdrop" data-close="1"></div><div class="contacts-modal__dialog"><button type="button" class="contacts-modal__close" data-close="1" aria-label="Закрыть">×</button><h3 class="contacts-modal__title">Контакты</h3><form class="contacts-form"><input name="name" placeholder="Имя" required><input name="contacts" placeholder="Контакты" required><textarea name="comment" placeholder="Комментарий"></textarea><button type="submit">Отправить</button></form></div>';
      document.body.appendChild(modal);
      function openModal(){modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}
      function closeModal(){modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';}
      contactsButton.addEventListener('click', openModal);
      modal.addEventListener('click', function (e) { if (e.target.closest('[data-close="1"]')) closeModal(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });
      modal.querySelector('.contacts-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var formData = new FormData(e.target);
        var subject = encodeURIComponent('Новая заявка с сайта');
        var body = encodeURIComponent('Имя: ' + (formData.get('name') || '') + '\nКонтакты: ' + (formData.get('contacts') || '') + '\nКомментарий: ' + (formData.get('comment') || ''));
        window.location.href = 'mailto:' + receiverEmail + '?subject=' + subject + '&body=' + body;
        closeModal();
      });
    }
    ---------- */
})();

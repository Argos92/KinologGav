/* ============================================================
   ОБЩИЙ СКРИПТ САЙТА «БЛАГОПОЛУЧНАЯ СОБАКА»
   Работает в связке с общим header (см. css/common.css):
   - кнопки записи и контактов открывают форму заявки;
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

    /* ---------- Форма записи к Марии ---------- */
    var contactTriggers = document.querySelectorAll('.contact-trigger, .cta-main-btn');

    if (contactTriggers.length) {
        var googleFormAction = 'https://docs.google.com/forms/d/e/1FAIpQLSfDIeWYM20dN8r2koMXgGV49qG7XZClAPoclxJj0yZWZRHNhQ/formResponse';
        var googleFormFields = {
            name: 'entry.398667946',
            pet: 'entry.889443764',
            problem: 'entry.1255608769'
        };
        var contactModal = document.createElement('div');
        contactModal.className = 'contacts-modal';
        contactModal.setAttribute('aria-hidden', 'true');
        contactModal.innerHTML = [
            '<div class="contacts-modal__backdrop" data-contact-close="1"></div>',
            '<div class="contacts-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="contacts-modal-title">',
                '<button type="button" class="contacts-modal__close" data-contact-close="1" aria-label="Закрыть">×</button>',
                '<h3 class="contacts-modal__title" id="contacts-modal-title">Записаться к Марии</h3>',
                '<form class="contacts-form">',
                    '<label class="contacts-form__field">',
                        '<span>Ваше имя</span>',
                        '<input name="name" autocomplete="name" required>',
                    '</label>',
                    '<label class="contacts-form__field">',
                        '<span>Ваш питомец</span>',
                        '<input name="pet" required>',
                    '</label>',
                    '<label class="contacts-form__field">',
                        '<span>Контакты</span>',
                        '<input name="contacts" autocomplete="tel" required>',
                    '</label>',
                    '<label class="contacts-form__field">',
                        '<span>Проблема</span>',
                        '<textarea name="problem" required></textarea>',
                    '</label>',
                    '<button type="submit">Отправить</button>',
                    '<p class="contacts-form__status" aria-live="polite"></p>',
                '</form>',
            '</div>'
        ].join('');
        document.body.appendChild(contactModal);

        var contactForm = contactModal.querySelector('.contacts-form');
        var contactStatus = contactModal.querySelector('.contacts-form__status');
        var submitButton = contactForm.querySelector('button[type="submit"]');

        function openContactModal() {
            contactModal.classList.add('is-open');
            contactModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            contactStatus.textContent = '';
            contactStatus.classList.remove('is-error');
            var firstInput = contactModal.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }

        function closeContactModal() {
            contactModal.classList.remove('is-open');
            contactModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        contactTriggers.forEach(function (trigger) {
            trigger.addEventListener('click', function (e) {
                e.preventDefault();
                openContactModal();
            });
        });

        contactModal.addEventListener('click', function (e) {
            if (e.target.closest('[data-contact-close="1"]')) {
                closeContactModal();
            }
        });

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var formData = new FormData(contactForm);
            var googleData = new FormData();
            var problemText = [
                formData.get('problem') || '',
                '',
                'Контакты: ' + (formData.get('contacts') || '')
            ].join('\n');

            googleData.append(googleFormFields.name, formData.get('name') || '');
            googleData.append(googleFormFields.pet, formData.get('pet') || '');
            googleData.append(googleFormFields.problem, problemText);

            submitButton.disabled = true;
            contactStatus.textContent = 'Отправляю заявку...';
            contactStatus.classList.remove('is-error');

            fetch(googleFormAction, {
                method: 'POST',
                mode: 'no-cors',
                body: googleData
            }).then(function () {
                contactForm.reset();
                contactStatus.textContent = 'Спасибо! Заявка отправлена.';
                setTimeout(closeContactModal, 1400);
            }).catch(function () {
                contactStatus.textContent = 'Не получилось отправить заявку. Попробуйте еще раз.';
                contactStatus.classList.add('is-error');
            }).finally(function () {
                submitButton.disabled = false;
            });
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && contactModal.classList.contains('is-open')) {
                closeContactModal();
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

})();

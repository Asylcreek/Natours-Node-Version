/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

//DOM Elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

//Values

//Delegation
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    // console.log(locations);

    displayMap(locations);
}

if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

if (logOutBtn) {
    logOutBtn.addEventListener('click', logout);
}

if (userDataForm) {
    userDataForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);

        updateSettings(form, 'data');
    });

    userPasswordForm.addEventListener('submit', async(event) => {
        event.preventDefault();
        document.querySelector('.btn--save-password').textContent = 'Updating ...';

        const currentPassword = document.getElementById('password-current').value;
        const newPassword = document.getElementById('password').value;
        const newPasswordConfirm = document.getElementById('password-confirm')
            .value;

        await updateSettings({ currentPassword, newPassword, newPasswordConfirm },
            'password'
        );

        document.querySelector('.btn--save-password').textContent = 'Save password';

        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    });
}

if (bookBtn) {
    bookBtn.addEventListener('click', async(event) => {
        event.target.textContent = 'Processing...';
        const { tourId } = event.target.dataset;
        await bookTour(tourId);
        event.target.textContent = 'Book tour now!';
    });
}
/* eslint-disable */
//import axios from 'axios';
//import { showAlert } from './alerts'

const stripe = Stripe('pk_test_51JDzc8KUAolV5WwaSHbOjfkAWbXHqsDeIe0Qr1rdZq6L5DN1SyBiopfdWE8Ny6bc6Euo4wid3BtF9Lpe651lr4uO00LhnarBlD');

const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);

    //2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });

  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};

let bookBtn = document.getElementById('book-tour');

if (bookBtn)
bookBtn.addEventListener('click', e => {
  e.target.textContent = 'Processing...';
  const { tourId } = e.target.dataset;
  bookTour(tourId);
});

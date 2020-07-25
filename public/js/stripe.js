import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
    'pk_test_51H8hhWDfO034zfR66jZbmPoIeQUCkdIWOEJ4dqzqXOZOkYwfpjc5bArgLFWu12pnVvZvRdvDBCVqbhfWfNYMjJWT00QmGq3HYS'
);

export const bookTour = async(tourId) => {
    try {
        //Get checkout session from server
        const session = await axios(
            `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
        );
        console.log(session);

        //Create checkout form + charge the credit card
        await stripe.redirectToCheckout({ sessionId: session.data.session.id });
    } catch (err) {
        console.log(err);
        showAlert('error', err);
    }
};
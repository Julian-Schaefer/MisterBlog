package org.sheeper.blogify.controller;

import org.sheeper.blogify.service.StripeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/subscription")
public class SubscriptionController {

    @Autowired
    private StripeService stripeService;

    @PostMapping
    public @ResponseBody String createSubscription(String email, String token, String plan) {
        // validate data
        if (token == null || plan.isEmpty()) {
            throw new RuntimeException("Stripe payment token is missing. Please, try again later.");
        }

        // create customer first
        String customerId = stripeService.createCustomer(email, token);

        if (customerId == null) {
            throw new RuntimeException("An error occurred while trying to create a customer.");
        }

        // create subscription
        String subscriptionId = stripeService.createSubscription(customerId, plan);
        if (subscriptionId == null) {
            throw new RuntimeException("An error occurred while trying to create a subscription.");
        }

        // Ideally you should store customerId and subscriptionId along with customer
        // object here.
        // These values are required to update or cancel the subscription at later
        // stage.

        return "Success! Your subscription id is " + subscriptionId;
    }

    @DeleteMapping
    public @ResponseBody String cancelSubscription(String subscriptionId) {
        boolean status = stripeService.cancelSubscription(subscriptionId);
        if (!status) {
            throw new RuntimeException("Failed to cancel the subscription. Please, try later.");
        }
        return "Subscription cancelled successfully.";
    }
}
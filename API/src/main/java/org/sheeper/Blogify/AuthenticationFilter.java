package org.sheeper.Blogify;

import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import javax.ws.rs.ext.Provider;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;

@Provider
public class AuthenticationFilter implements ContainerRequestFilter {

    @Override
    public void filter(ContainerRequestContext requestContext) {
        var idToken = requestContext.getHeaderString("Authorization");
        if (idToken == null) {
            requestContext.abortWith(Response.status(Status.FORBIDDEN).build());
            return;
        }

        try {
            FirebaseAuth.getInstance().verifyIdToken(idToken);
        } catch (FirebaseAuthException e) {
            requestContext.abortWith(Response.status(Status.FORBIDDEN).build());
        }
    }
}
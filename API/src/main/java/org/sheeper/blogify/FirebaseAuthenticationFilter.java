package org.sheeper.blogify;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

public class FirebaseAuthenticationFilter extends OncePerRequestFilter {

    private static String HEADER_STRING = "Authorization";
    private static String TOKEN_PREFIX = "Bearer ";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader(HEADER_STRING);

        if (header == null || !header.startsWith(TOKEN_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        var bearerToken = header.substring(TOKEN_PREFIX.length());
        var userId = verifyToken(bearerToken);

        if (userId != null) {
            var token = new UsernamePasswordAuthenticationToken(userId, null, null);
            SecurityContextHolder.getContext().setAuthentication(token);
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
    }

    private String verifyToken(String bearerToken) {
        try {
            var firebaseToken = FirebaseAuth.getInstance().verifyIdToken(bearerToken);
            return firebaseToken.getUid();
        } catch (FirebaseAuthException e) {
            System.err.println("Could not verify Token");
        }

        return null;
    }

}
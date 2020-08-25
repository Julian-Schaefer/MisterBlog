package org.sheeper.Blogify;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Observes;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import io.quarkus.runtime.ShutdownEvent;
import io.quarkus.runtime.StartupEvent;
import org.jboss.logging.Logger;

@ApplicationScoped
public class AppLifecycleBean {

    private static final Logger LOGGER = Logger.getLogger("AppLifecycleBean");

    void onStart(@Observes StartupEvent ev) {
        LOGGER.info("The application is starting...");

        try {
            FirebaseApp.getInstance();
        } catch (IllegalStateException ex) {
            try {
                FileInputStream serviceAccount = new FileInputStream("/Users/julian/Downloads/firebase.json");
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .setDatabaseUrl("https://blogify-cdb97.firebaseio.com").build();

                FirebaseApp.initializeApp(options);
                LOGGER.info("Initialized Firebase successfully!");
            } catch (FileNotFoundException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    void onStop(@Observes ShutdownEvent ev) {
        LOGGER.info("The application is stopping...");
    }
}
package org.sheeper.blogify;

import java.io.IOException;
import java.io.InputStream;
import java.io.ByteArrayInputStream;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

@SpringBootApplication
public class BlogifyApplication {

	public static void main(String[] args) {
		SpringApplication.run(BlogifyApplication.class, args);
	}

	@EventListener(ApplicationReadyEvent.class)
	public void initializeFirebase() {
		try {
			FirebaseApp.getInstance();
		} catch (IllegalStateException ex) {
			try {
				String serviceAccountString = System.getenv("FIREBASE");
				InputStream serviceAccount = new ByteArrayInputStream(serviceAccountString.getBytes());

				FirebaseOptions options = FirebaseOptions.builder()
						.setCredentials(GoogleCredentials.fromStream(serviceAccount))
						.setDatabaseUrl(System.getenv("FIREBASE_DATABASE_URL")).build();

				FirebaseApp.initializeApp(options);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}
}

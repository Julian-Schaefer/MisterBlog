package org.sheeper.blogify;

import java.io.IOException;
import java.io.InputStream;
import java.io.ByteArrayInputStream;
import java.io.FileInputStream;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

@SpringBootApplication
public class BlogifyApplication {

	@Value("${firebase.location}")
	private String firebaseLocation;

	@Value("${firebase.url}")
	private String firebaseDatabaseUrl;

	public static void main(String[] args) {
		SpringApplication.run(BlogifyApplication.class, args);
	}

	@EventListener(ApplicationReadyEvent.class)
	public void initializeFirebase() {
		try {
			FirebaseApp.getInstance();
		} catch (IllegalStateException ex) {
			try {
				InputStream serviceAccount = null;

				if (firebaseLocation != null) {
					serviceAccount = new FileInputStream(firebaseLocation);
				} else {
					String serviceAccountString = System.getenv("FIREBASE");
					serviceAccount = new ByteArrayInputStream(serviceAccountString.getBytes());
				}

				if (firebaseDatabaseUrl == null) {
					firebaseDatabaseUrl = System.getenv("FIREBASE_DATABASE_URL");
				}

				FirebaseOptions options = FirebaseOptions.builder()
						.setCredentials(GoogleCredentials.fromStream(serviceAccount))
						.setDatabaseUrl(firebaseDatabaseUrl).build();

				FirebaseApp.initializeApp(options);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}
}

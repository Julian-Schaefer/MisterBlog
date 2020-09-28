package org.sheeper.blogify;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;

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
				FileInputStream serviceAccount = new FileInputStream("C:\\Users\\julia\\Downloads\\firebase.json");
				FirebaseOptions options = FirebaseOptions.builder()
						.setCredentials(GoogleCredentials.fromStream(serviceAccount))
						.setDatabaseUrl("https://blogify-cdb97.firebaseio.com").build();

				FirebaseApp.initializeApp(options);
			} catch (FileNotFoundException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}
}

package org.sheeper.blogify.controller;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URL;

import javax.imageio.ImageIO;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/image")
public class ImageController {

    @GetMapping
    public ResponseEntity<byte[]> getImageAsResponseEntity(@RequestParam("url") String imageUrl) {
        try {
            var headers = new HttpHeaders();
            byte[] imageData = getImageBytes(imageUrl);
            headers.setCacheControl(CacheControl.noCache().getHeaderValue());

            if (imageUrl.contains(".jpg")) {
                headers.setContentType(MediaType.IMAGE_JPEG);
            } else if (imageUrl.contains(".png")) {
                headers.setContentType(MediaType.IMAGE_PNG);
            } else if (imageUrl.contains(".gif")) {
                headers.setContentType(MediaType.IMAGE_GIF);
            } else if (imageUrl.contains(".svg")) {
                headers.setContentType(MediaType.valueOf("image/svg+xml"));
            }

            ResponseEntity<byte[]> responseEntity = new ResponseEntity<>(imageData, headers, HttpStatus.OK);
            return responseEntity;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private static byte[] getImageBytes(String imageUrl) throws IOException {
        var url = new URL(imageUrl);

        var bufferedImage = ImageIO.read(url);
        var bos = new ByteArrayOutputStream();

        if (imageUrl.contains(".jpg") || imageUrl.contains(".jpeg")) {
            ImageIO.write(bufferedImage, "jpg", bos);
        } else if (imageUrl.contains(".png")) {
            ImageIO.write(bufferedImage, "png", bos);
        } else if (imageUrl.contains(".gif")) {
            ImageIO.write(bufferedImage, "gif", bos);
        } else if (imageUrl.contains(".svg")) {
            ImageIO.write(bufferedImage, "svg", bos);
        }

        byte[] data = bos.toByteArray();
        return data;
    }
}

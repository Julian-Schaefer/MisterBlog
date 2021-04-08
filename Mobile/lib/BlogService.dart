import 'dart:io';

import 'package:blogify/BlogPost.dart';
import 'package:blogify/JsonInterceptor.dart';
import 'package:blogify/SelectedBlog.dart';
import 'package:http/http.dart';
import 'dart:convert';

import 'package:http_interceptor/http_client_with_interceptor.dart';

class BlogService {
  static Client _client = HttpClientWithInterceptor.build(interceptors: [
    JsonInterceptor(),
  ]);

  static final String _baseUrl = "https://blogify-api.herokuapp.com";

  static Future<List<BlogPost>> getBlogPosts(int offset) async {
    var relativeUrl = "/blog-selection";
    if (offset > 0) {
      relativeUrl += "?offset=" + offset.toString();
    }

    try {
      final response = await _client.get(Uri.parse(_baseUrl + relativeUrl));

      if (response.statusCode == 200) {
        final parsedJson =
            jsonDecode(response.body).cast<Map<String, dynamic>>();

        return parsedJson
            .map<BlogPost>((json) => BlogPost.fromJson(json))
            .toList();
      } else {
        // If the server did not return a 200 OK response,
        // then throw an exception.
        throw Exception('Failed to load Blog Posts.');
      }
    } on SocketException {
      return Future.error('No Internet connection 😑');
    } on FormatException {
      return Future.error('Bad response format 👎');
    } on Exception {
      return Future.error('Unexpected error 😢');
    }
  }

  static Future<List<SelectedBlog>> getSelectedBlogs() async {
    var relativeUrl = "/blog-selection/selected";

    try {
      final response = await _client.get(Uri.parse(_baseUrl + relativeUrl));

      if (response.statusCode == 200) {
        final parsedJson =
            jsonDecode(response.body).cast<Map<String, dynamic>>();

        return parsedJson
            .map<SelectedBlog>((json) => SelectedBlog.fromJson(json))
            .toList();
      } else {
        // If the server did not return a 200 OK response,
        // then throw an exception.
        throw Exception('Failed to load Blog Posts.');
      }
    } on SocketException {
      return Future.error('No Internet connection 😑');
    } on FormatException {
      return Future.error('Bad response format 👎');
    } on Exception {
      return Future.error('Unexpected error 😢');
    }
  }

  static Future<void> setSelectedBlogs(List<SelectedBlog> selectedBlogs) async {
    var relativeUrl = "/blog-selection/selected";

    try {
      final response = await _client.post(Uri.parse(_baseUrl + relativeUrl),
          body: jsonEncode(selectedBlogs));

      if (response.statusCode == 200) {
        return;
      } else {
        // If the server did not return a 200 OK response,
        // then throw an exception.
        throw Exception('Failed to load Blog Posts.');
      }
    } on SocketException {
      return Future.error('No Internet connection 😑');
    } on FormatException {
      return Future.error('Bad response format 👎');
    } catch (e) {
      return Future.error('Unexpected error 😢');
    }
  }
}

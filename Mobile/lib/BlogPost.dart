class BlogPost {
  final String title;
  final String date;
  final List<String> authors;
  final String summary;
  final String content;
  final String blogUrl;
  final String postUrl;

  BlogPost(
      {required this.title,
      required this.date,
      required this.authors,
      required this.summary,
      required this.content,
      required this.blogUrl,
      required this.postUrl});

  factory BlogPost.fromJson(Map<String, dynamic> json) {
    return BlogPost(
      title: json['title'],
      date: json['date'] != null ? json['date'] : 'N/A',
      authors: List<String>.from(json['authors']),
      summary: json['summary'],
      content: json['content'],
      blogUrl: json['blogUrl'],
      postUrl: json['postUrl'],
    );
  }
}

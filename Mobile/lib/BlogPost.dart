class BlogPost {
  final String title;
  final String date;
  final String author;
  final String introduction;
  final String content;
  final String blogUrl;
  final String postUrl;

  BlogPost(
      {required this.title,
      required this.date,
      required this.author,
      required this.introduction,
      required this.content,
      required this.blogUrl,
      required this.postUrl});

  factory BlogPost.fromJson(Map<String, dynamic> json) {
    return BlogPost(
      title: json['title'],
      date: json['date'],
      author: json['author'],
      introduction: json['introduction'],
      content: json['content'],
      blogUrl: json['blogUrl'],
      postUrl: json['postUrl'],
    );
  }
}

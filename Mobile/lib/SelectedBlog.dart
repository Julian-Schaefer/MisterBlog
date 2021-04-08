class SelectedBlog {
  final String blogUrl;
  final bool selected;

  SelectedBlog({required this.blogUrl, required this.selected});

  factory SelectedBlog.fromJson(Map<String, dynamic> json) {
    return SelectedBlog(
      blogUrl: json['blogUrl'],
      selected: json['selected'],
    );
  }
}

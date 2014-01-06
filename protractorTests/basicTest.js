describe('the editor starting page', function() {
  it('should load the article title', function() {
    browser.get('http://127.0.0.1:9000');

    var body = element(by.css('.main-article-title'));

    expect(body.getText()).toEqual('European Council candidates set to be named');
  });
});

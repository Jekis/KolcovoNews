host = 'http://kolcovo.ru';
hostNewsUrl = '/content/news/';

function showMessage(text) {
    $('#news').html('<p>'+ text +'</p>');
}

function hidePopup(delay) {
    delay = delay || 500;

    setTimeout(function () {
        window.close();
    }, delay);
}

function extractNews(html) {
    var regExps = {
        allNews: /<p[^>]+class="news-item"(?:.|[\r\n])+?<\/p>/gmi,
        pictureUrl: /src="(.+?)"/i,
        newsTitle: /alt="(.+?)"/i,
        newsPublishedDate: /news-date-time[^>]+>(.+?)<\/span/i,
        newsUrl: /href="(.+?news=\d+)"/i
    };

    var newsHtml = html.match(regExps.allNews);

    if (!newsHtml) {
        return showMessage('Новости не были найдены на странице.');
    }

    var news = [];

    for (var i = 0; i < newsHtml.length; i++) {
        var matches;
        var newsItem = {
            title: null,
            publishedAt: null,
            url: null,
            pictureUrl: null
        };

        // Extract title
        matches = newsHtml[i].match(regExps.newsTitle);
        if (matches) {
            newsItem.title = matches[1];
        }

        // Extract date
        matches = newsHtml[i].match(regExps.newsPublishedDate);
        if (matches) {
            newsItem.publishedAt = matches[1];
        }

        // Extract picture
        matches = newsHtml[i].match(regExps.pictureUrl);
        if (matches) {
            newsItem.pictureUrl = host + matches[1];
        }

        // Extract url
        matches = newsHtml[i].match(regExps.newsUrl);
        if (matches) {
            newsItem.url = host + matches[1];
        }

        news.push(newsItem);
    }

    return news;
}

function renderNewsTo(responseText, newsContainer) {
    newsContainer.empty();

    var news = extractNews(responseText);
    var prevDate;
    var today = new Date();
    var noNewsForToday = news[0].publishedAt.match(/^\d+/) != today.getDate();
    var todayText = 'Сегодня';
    var noNewsText = 'Нет новостей';

    if (noNewsForToday) {
        newsContainer.append($('<h4>' + todayText + '</h4><div>'+ noNewsText +'</div>'));
    }

    for (var i = 0; i < news.length; i++) {
        var date = news[i].publishedAt.match(/^(\d+) [^\s]+/i); // Matches "24 сентября"
        var showDate;

        // Group news by date
        if (date[0] !== prevDate) {
            showDate = date[1] == today.getDate() ? todayText : date[0];
            newsContainer.append($('<h4>' + showDate + '</h4>'));
            prevDate = date[0];
        }

        // Create div with background image
        var image = '';
        if (news[i].pictureUrl) {
            image = '<div class="image" style="background-image: url('+ news[i].pictureUrl +');"></div> ';
        }

        newsContainer.append($(
            '<div>' +
                image +
                '<span class="news-date-time">'+ news[i].publishedAt +'</span><br>' +
                (
                    news[i].url ?
                    '<a class="title" href="'+ news[i].url +'">' + news[i].title + '</a>' :
                    '<span class="title">'+  news[i].title +'</span>'
                ) +
            '</div>'
        ));
    }

    newsContainer.find('a').each(function () {
        $(this).attr('target', '_blank');
    });
}

function showNews() {
    $
        .get(host + hostNewsUrl, function (data) {
            renderNewsTo(data, $('#news'));

            $('a').click(function () {
                hidePopup();
            });
        })
        .fail(function () {
            showMessage('Не удалось получить новости');
        })
        .always(function () {
            //
        });
}


$(function () {
    showNews();
});

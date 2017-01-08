host = 'http://kolcovo.ru';
hostNewsUrl = '/content/news/';

function showMessage(text) {
    var newsContainerEl;

    if (!window.newsContainer) {
        document.write(text);
    } else {
        // TODO: Avoid using jQuery
        newsContainerEl = window.newsContainer.get(0);
    }

    newsContainerEl.innerHTML = '';
    newsContainerEl.appendChild(createElement('p', text));
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
        return false;
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

/**
 * Helper create node with text.
 *
 * @param tagName
 * @param text
 * @returns {Element}
 */
function createElement(tagName, text) {
    var node = document.createElement(tagName);

    if (text && text.length) {
        var textNode = document.createTextNode(text);
        node.appendChild(textNode);
    }

    return node;
}

function renderNewsTo(responseText, newsContainer) {
    newsContainer.empty();
    var newsContainerEl = newsContainer.get(0);

    var news = extractNews(responseText);

    if (!news) {
        return showMessage('Новости не были найдены на странице.');
    }

    var prevDate;
    var today = new Date();
    var noNewsForToday = news[0].publishedAt.match(/^\d+/) != today.getDate();
    var todayText = 'Сегодня';
    var noNewsText = 'Нет новостей';

    if (noNewsForToday) {
        newsContainerEl.appendChild(createElement('h4', todayText));
        newsContainerEl.appendChild(createElement('div', noNewsText));
    }

    for (var i = 0; i < news.length; i++) {
        var date = news[i].publishedAt.match(/^(\d+) [^\s]+/i); // Matches "24 сентября"
        var showDate;

        // Group news by date
        if (date[0] !== prevDate) {
            showDate = date[1] == today.getDate() ? todayText : date[0];
            newsContainerEl.appendChild(createElement('h4', showDate));
            prevDate = date[0];
        }

        var itemDiv = createElement('div');

        // Create div with background image
        if (news[i].pictureUrl) {
            var image;

            image = createElement('div');
            image.className = 'image';
            image.style.backgroundImage = 'url('+ news[i].pictureUrl +')';

            itemDiv.appendChild(image);
        }

        // Create date element
        var dateEl = createElement('span', news[i].publishedAt);
        dateEl.className = 'news-date-time';
        itemDiv.appendChild(dateEl);
        itemDiv.appendChild(createElement('br'));

        // Create title
        var title;
        if (news[i].url) {
            title = createElement('a', news[i].title);
            title.className = 'title';
            title.href = news[i].url;
        } else {
            title = createElement('span', news[i].title);
        }

        itemDiv.appendChild(title);

        newsContainerEl.appendChild(itemDiv);
    }

    // TODO: Avoid using jQuery
    newsContainer.find('a').each(function () {
        $(this).attr('target', '_blank');
    });
}

function showNews(newsContainer) {
    $
        .get(host + hostNewsUrl, function (data) {
            renderNewsTo(data, newsContainer);

            // TODO: Avoid using jQuery
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
    // TODO: Avoid using jQuery
    window.newsContainer = $('#news');

    showNews(window.newsContainer);
});

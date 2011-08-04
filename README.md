To enable this plugin, you need to add these values to the nerdie config:

```
{
    "plugins": {
        "notify": {
                "announce": {
                        "reponame": ["#channel1","#channel2"]
                },
                "bitly_username": "<bitly username>",
                "bitly_apikey": "<bitly API key>"
        }
    }
}
```

As of this writing, the bitly npm package is broken (http://asym.us/qXLkMv), and installing npm solely via `npm install` will fail to enable Bit.ly shortening of commit links.  To fix this problem, you should install node-bitly manually, using `npm link`:

1. mkdir ~/dev/node-bitly
2. cd ~/dev/node-bitly
3. git clone https://github.com/tanepiper/node-bitly.git
4. npm link
5. cd ~/dev/nerdie  # the location of your nerdie
6. npm link bitly



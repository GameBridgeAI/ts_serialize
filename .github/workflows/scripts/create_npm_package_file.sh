name="$1"

if [ -z "$1" ]; then
    echo "Error: Tag version not provided";
    exit 1
fi

cat <<EOF >> "package.json" 
{
  "name": "ts_serialize",
  "version": "$1",
  "description": "A zero dependency library for serializing data.",
  "main": "index.js",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/GameBridgeAI/ts_serialize.git"
  },
  "author": "GameBridgeAI",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/GameBridgeAI/ts_serialize/issues"
  },
  "homepage": "https://github.com/GameBridgeAI/ts_serialize#readme"
}
EOF
    
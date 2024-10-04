### init projects

```
fullstack-monorepo/
  ├── apps/
  │   ├── api/      (NestJS 프로젝트)
  │   └── ui/       (React Vite 프로젝트)
  ├── packages/     (공유 패키지가 필요한 경우)
  ├── package.json
  └── turbo.json
```

Commands,

mkdir {project-name} && cd cd {project-name}
npm init -y
npm install -D turbo

mkdir apps
npm install -g @nestjs/cli
nest new api
npm create vite@latest ui

```
{
  "devDependencies": {
    "turbo": "^2.0.11"
  },
  "workspaces": [
      "apps/*"
  ]
}
```

최종 폴더 구조는 apps 폴더 안쪽에 nestjs의 api 프로젝트와 react의 ui 프로젝트가 공존하는 형태

### turbo package scripts

"turbo.json" 파일 생성 https://turbo.build/repo/docs/reference/configuration

기존 pipeline에서 tasks로 변경됨

```
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {  /* npm script의 'dev'를 사용하겠다는 뜻  */
        "cache": false
    }
  },
}
```

package.json

```
  "scripts": {
    "dev": "turbo run dev"
  },
```

npm dev 는
apps내 scripts의 dev를 실행함을 의미

apps/ui/package.json
dev는 이미 있기때문에 그대로 유지,

apps/api/package.json
dev 대신 start:dev로 되어있기 때문에 이름을 변경 : start:dev --> dev

### vite.config.ts에 proxy 추가 (ui)

api : http://localhost:3000/
ui : http://localhost:5173/

이제 proxy설정을 통해 api를 http://localhost:5173/api/로 사용하도록 설정

```
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
```

http://localhost:5173/api/ 접속해보면,

```
{
"message": "Cannot GET /api",
"error": "Not Found",
"statusCode": 404
}
```

백엔드 설정이 추가로 필요한 상황, GlobalPrefix 추가

api/src/main.ts

```
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.listen(3000);
```

다시 접속 http://localhost:5173/api 성공.
더 대단한건 바로바로 서버가 reload가 된다..

### ui test

ui -> api request test

```
function App() {
  const [serverText, setServerText] = useState("");

  useEffect(() => {
    fetch("/api")
      .then((res) => res.text())
      .then(setServerText);
  }, []);

  return (
    <>
      <h1>Vite + React</h1>
      api response 👉 {serverText}
    </>
  );
}

export default App;
```

### build

turbo.json

```
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "persistent": true,
      "cache": false
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}

```

package.json

```
    "build": "turbo run build"
```

각각의 dist 디렉토리에 빌드 파일이 생김
api/dist/
ui/dist/

build한 이후 배포직전의 상태라면 빌드된 react만 필요할 것이기 때문에, nestjs의 serve static을 이용

```
npm install --workspace api @nestjs/serve-static
```

- https://docs.nestjs.com/recipes/serve-static

api/src/app.module.ts에 static 추가

```
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'ui', 'dist'),
    }),
  ],
```

package.json에 start 추가

```
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "start": "node apps/api/dist/main"
  },
```

### start server

npm run start
http://localhost:3000

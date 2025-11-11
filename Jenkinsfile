pipeline {
    agent any 

    environment {
        ALIYUN_CREDS_ID = 'LTAI5tCrPDaDWZsjM7GNbigM' 
        OSS_BUCKET = 'oss://voidx-ai-add-on' // 'oss://' 접두사를 포함한 전체 경로
        CDN_DOMAIN = 'https://addon-cdn.voidx.ai'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/upfall-co/voidx-ai-add-on.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                // npm ci를 사용하면 package-lock.json을 기반으로 더 빠르고 일관된 설치가 가능합니다.
                sh 'npm ci'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        /**
         * 새로운 스테이지: 빌드된 JS 파일을 Alibaba OSS에 업로드합니다.
         * 'aliyun-oss' Jenkins 플러그인이 필요합니다.
         */
        stage('Upload to OSS') {
            steps {
                script {
                    // 1. OSS_BUCKET 환경 변수에서 'oss://' 접두사를 제거하여 순수 버킷 이름만 추출합니다.
                    def bucketName = env.OSS_BUCKET.replace('oss://', '')
                    
                    // 2. 'dist' 디렉토리 내부에서 작업을 수행합니다.
                    //    이렇게 하면 파일 경로에서 'dist/' 접두사가 제거된 상태로 업로드됩니다.
                    //    예: 'dist/static/main.js' -> 'static/main.js' (버킷 경로)
                    dir('dist') {
                        echo "Uploading JS files to OSS bucket: ${bucketName}"
                        
                        // 3. aliyunOSSUpload 스텝을 사용하여 업로드합니다.
                        aliyunOSSUpload(
                            credentialsId: env.ALIYUN_CREDS_ID, 
                            bucketName: bucketName, 
                            filesPath: '**/*.js',  // 'dist' 디렉토리 하위의 모든 .js 파일을 대상으로 함
                            targetPath: '/'         // 버킷의 루트 경로에 업로드
                        )
                    }
                }
            }
        }
    }
    
    post {
        always {
            // 빌드 완료 후 작업 공간 정리
            deleteDir()
        }
    }
}
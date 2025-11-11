pipeline {
    agent any 

    environment {
        ALIYUN_CREDS_ID = 'LTAI5tCrPDaDWZsjM7GNbigM' 
        OSS_BUCKET = 'oss://voidx-ai-add-on'
        CDN_DOMAIN = 'https://addon-cdn.voidx.ai'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/upfall-co/voidx-ai-add-on'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        // // 7. Aliyun Credentials 플러그인으로 인증 정보 감싸기
        // alibabaCloudCredentials(credentialsId: ALIYUN_CREDS_ID) {
            
        //     stage('Upload to Versioned Path (Immutable)') {
        //         steps {
        //             // 8. 버전 경로로 업로드 (불변 캐시 설정)
        //             // aliyun oss cp [소스] [대상] --recursive --meta [헤더]
        //             sh """
        //             aliyun oss cp ./dist/ ${OSS_BUCKET}/v${env.VERSION}/ \
        //                 --recursive \
        //                 --meta "Cache-Control:max-age=31536000,immutable"
        //             """
        //         }
        //     }

        //     stage('Upload to Latest Path (Mutable)') {
        //         steps {
        //             // 9. 'latest' 경로로 업로드 (짧은 캐시 설정)
        //             sh """
        //             aliyun oss cp ./dist/ ${OSS_BUCKET}/latest/ \
        //                 --recursive \
        //                 --meta "Cache-Control:max-age=300,public"
        //             """
        //         }
        //     }

        //     stage('Invalidate CDN Cache') {
        //         steps {
        //             // 10. 'latest' 디렉토리 캐시 무효화
        //             // aliyun cdn RefreshObjectCaches --ObjectPath [도메인/경로] --ObjectType Directory
        //             sh """
        //             aliyun cdn RefreshObjectCaches \
        //                 --ObjectPath "https://${CDN_DOMAIN}/latest/" \
        //                 --ObjectType "Directory"
        //             """
        //         }
        //     }
        // }
    }
    
    post {
        always {
            // 빌드 완료 후 워크스페이스 정리
            deleteDir()
        }
    }
}
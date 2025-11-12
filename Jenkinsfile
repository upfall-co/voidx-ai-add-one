pipeline {
    agent any 

    environment {
        OSS_BUCKET = 'oss://voidx-ai-add-on' 
        CDN_DOMAIN = 'https://addon-cdn.voidx.ai'
        ALIYUN_CREDS_ID = 'aliyun-oss-creds'
    }

    stages {
        // ... (Checkout, Install, Build 단계는 동일) ...

        stage('Upload to OSS') {
            steps {
                script {
                    def bucketName = env.OSS_BUCKET.replace('oss://', '')
                    
                    withCredentials([usernamePassword(credentialsId: env.ALIYUN_CREDS_ID, 
                                                     usernameVariable: 'ALIYUN_KEY_ID', 
                                                     passwordVariable: 'ALIYUN_KEY_SECRET')]) {
                        
                        dir('dist') {
                            echo "Uploading 'voidx-ai-addon.es.js' to OSS bucket: ${bucketName}"
                            
                            // 디버깅용 로그 (파일이 있는지 마지막으로 확인)
                            sh 'ls -l' 

                            aliyunOSSUpload(
                                accessKeyId: env.ALIYUN_KEY_ID,
                                accessKeySecret: env.ALIYUN_KEY_SECRET,
                                endpoint: "oss-ap-northeast-2.aliyuncs.com",
                                bucketName: bucketName,
                                
                                // [수정] 와일드카드 대신 정확한 파일 이름을 지정합니다.
                                localPath: 'voidx-ai-addon.es.js', 
                                
                                remotePath: '/' // 버킷 루트에 업로드합니다.
                            )
                        }
                    }
                }
            }
        }
    }
    
    post {
        always {
            deleteDir()
        }
    }
}
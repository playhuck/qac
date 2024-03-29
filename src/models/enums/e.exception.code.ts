export const NOT_FOUND_URL_STATUS_CODE = 499;

export enum ECustomExceptionCode {

  /** 중복된 아이디입니다. */ 'USER-001' = 'USER-001',
  /** 존재하지 않는 유저 */ 'USER-002' = 'USER-002',

  /** 관리자 계정이 아님 */ 'ADMIN-001' = 'ADMIN-001',

  /** 문제 타입 불일치 */ 'QUESTION-001' = 'QUESTION-001',
  /** 문제를 찾을 수 없음 */ 'QUESTION-002' = 'QUESTION-002',
  /** 특정 문제 별 일일 이용한도 초과 */ 'QUESTION-003' = 'QUESTION-003',
  /** 문제 오답 */ 'QUESTION-004' = 'QUESTION-004',
  /** 풀 수 있는 문제 미존재 */ 'QUESTION-005' = 'QUESTION-005',
  
  /** 특정 MID 별 일일 이용한도 초과 */ 'MID-001' = 'MID-001',
  /** 특정 MID 별 3시간 별 이용한도 초과 */ 'MID-002' = 'MID-002',
  /** 특정 MID 별 전체 이용한도 초과 */ 'MID-003' = 'MID-003',
  /** 특정 MID 별 한 달 이용한도 초과 */ 'MID-004' = 'MID-004',

  /** 비밀번호 불일치 */ 'INCORECT-PWD' = 'INCORECT-PWD',
  /** DB 비밀번호 불일치 */ 'INCORECT-DB-PWD' = 'INCORECT-DB-PWD',

  /** TOKEN 자체가 없는 경우 */ 'JWT-001' = 'JWT-001',
  /** TOKEN TYPE 불일치 */ 'JWT-002' = 'JWT-002',

  'AWS-RDS-EXCEPTION' = 'AWS-RDS-EXCEPTION',

  /** MARIA DB Pool 또는 Connection 관련 에러 */
  'DB-CONNECTION-EXCEPTION' = 'DB-CONNECTION-EXCEPTION',
 
  /** 예외처리 하지 못한 경우 */
  'UNKNOWN-SERVER-ERROR' = 'UNKNOWN-SERVER-ERROR',
  'INTERVAL-SERVER-ERROR' = 'INTERVAL-SERVER-ERROR',

}
import { JobStatus } from '../../../common/enums/job-status.enum';
import { JobType } from '../../../common/enums/job-type.enum';
import { ApplicationStage } from '../../../common/enums/application-stage.enum';

export const recruitmentData = {
  vacancies: [
    {
      key: 'job-1',
      title: 'Senior Backend Engineer',
      description: 'We are looking for a Senior Backend Engineer to join our core team.',
      status: JobStatus.OPEN,
      type: JobType.FULL_TIME,
      departmentKey: 'engineering',
      applications: [
        { name: 'Artem Sokolov', email: 'artem.s@example.com', stage: ApplicationStage.HIRED },
        { name: 'Ivan Petrov', email: 'ivan.p@example.com', stage: ApplicationStage.HIRED },
        { name: 'Dmitry Volkov', email: 'dmitry.v@example.com', stage: ApplicationStage.HIRED },
        { name: 'Elena Belova', email: 'elena.b@example.com', stage: ApplicationStage.OFFER },
        { name: 'Sergei Ivanov', email: 'sergei.i@example.com', stage: ApplicationStage.TECHNICAL },
        {
          name: 'Marina Kozlova',
          email: 'marina.k@example.com',
          stage: ApplicationStage.INTERVIEW,
        },
        {
          name: 'Alexey Morozov',
          email: 'alexey.m@example.com',
          stage: ApplicationStage.SCREENING,
        },
        { name: 'Olga Pavlova', email: 'olga.p@example.com', stage: ApplicationStage.APPLIED },
      ],
    },
    {
      key: 'job-2',
      title: 'Frontend Developer (React)',
      description: 'Join our product team to build amazing user interfaces.',
      status: JobStatus.OPEN,
      type: JobType.FULL_TIME,
      departmentKey: 'engineering',
      applications: [
        { name: 'Konstantin Lebedev', email: 'konst.l@example.com', stage: ApplicationStage.HIRED },
        { name: 'Yulia Semenova', email: 'yulia.s@example.com', stage: ApplicationStage.HIRED },
        { name: 'Pavel Andreev', email: 'pavel.a@example.com', stage: ApplicationStage.OFFER },
        {
          name: 'Svetlana Orlova',
          email: 'svetlana.o@example.com',
          stage: ApplicationStage.TECHNICAL,
        },
        { name: 'Maxim Denisov', email: 'maxim.d@example.com', stage: ApplicationStage.INTERVIEW },
        {
          name: 'Natalia Rybakova',
          email: 'natalia.r@example.com',
          stage: ApplicationStage.SCREENING,
        },
        { name: 'Andrey Smirnov', email: 'andrey.s@example.com', stage: ApplicationStage.APPLIED },
        {
          name: 'Viktoria Kuzmina',
          email: 'viktoria.k@example.com',
          stage: ApplicationStage.REJECTED,
        },
      ],
    },
  ],
};

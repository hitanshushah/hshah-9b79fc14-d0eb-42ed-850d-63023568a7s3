import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TasksService],
    });
    service = TestBed.inject(TasksService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch tasks', () => {
    const mockTasks = [
      {
        id: 't1',
        title: 'Test Task',
        description: null,
        statusId: 's1',
        orderIndex: 0,
        ownerId: 'u1',
        organizationId: 'org1',
        createdAt: '',
        updatedAt: '',
      },
    ];

    service.list().subscribe((tasks) => {
      expect(tasks.length).toBe(1);
      expect(tasks[0].title).toBe('Test Task');
    });

    const req = httpMock.expectOne((r) => r.url.includes('/tasks') && r.method === 'GET');
    req.flush(mockTasks);
  });

  it('should create task', () => {
    const dto = { title: 'New Task', statusId: 's1' };
    const created = {
      id: 't2',
      ...dto,
      description: null,
      orderIndex: 0,
      ownerId: 'u1',
      organizationId: 'org1',
      createdAt: '',
      updatedAt: '',
    };

    service.create(dto).subscribe((task) => {
      expect(task.title).toBe('New Task');
      expect(task.id).toBe('t2');
    });

    const req = httpMock.expectOne((r) => r.url.includes('/tasks') && r.method === 'POST');
    expect(req.request.body).toEqual(dto);
    req.flush(created);
  });
});

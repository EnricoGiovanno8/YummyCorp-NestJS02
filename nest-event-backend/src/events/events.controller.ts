import { Body, ClassSerializerInterceptor, Controller, Delete, ForbiddenException, Get, HttpCode, Logger, NotFoundException, Param, ParseIntPipe, Patch, Post, Query, SerializeOptions, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { CreateEventDto } from "./input/create-event.dto";
import { EventsService } from "./events.service";
import { UpdateEventDto } from "../events/input/update-event.dto";
import { ListEvents } from "./input/list.events";
import { CurrentUser } from "src/auth/current-user.decorator";
import { User } from "src/auth/user.entity";
import { AuthGuardJwt } from "src/auth/auth-guard.jwt";

@Controller('events')
@SerializeOptions({ strategy: 'excludeAll' })
export class EventsController {
    private readonly logger = new Logger(EventsController.name)

    constructor(
        private readonly eventsService: EventsService
    ) {}

    @Get()
    @UsePipes(new ValidationPipe({ transform: true }))
    @UseInterceptors(ClassSerializerInterceptor)
    async findAll(@Query() filter: ListEvents) {
        const events = await this.eventsService.getEventsWithAttendeeCountFilteredPaginated(
            filter,
            {
                total: true,
                currentPage: filter.page,
                limit: 2
            }
        )
        return events
    }

    // @Get('practice')
    // async practice() {
    //     return await this.repository.find({
    //         select: ['id', 'when'],
    //         where: [{
    //             id: MoreThan(3),
    //             when: MoreThan(new Date('2021-02-12T13:00:00'))
    //         }, {
    //             description: Like('%meet%')
    //         }],
    //         take: 2,
    //         order: {
    //             id: 'DESC'
    //         }
    //     })
    // }

    // @Get('practice2')
    // async practice2() {
    //     // return await this.repository.findOne(1, { relations: ['attendees'] })
    //     const event = await this.repository.findOne(1, { relations: ['attendees'] })
    //     // const event = new Event()
    //     // event.id = 1

    //     const attendee = new Attendee()
    //     attendee.name = 'Using Cascade'
    //     // attendee.event = event

    //     event.attendees.push(attendee)

    //     // await this.attendeeRepository.save(attendee)
    //     await this.repository.save(event)

    //     return event
    // }

    @Get(':id')
    @UseInterceptors(ClassSerializerInterceptor)
    async findOne(
        @Param('id', ParseIntPipe) id: number
    ) {
        const event = await this.eventsService.getEvent(id)

        if(!event) {
            throw new NotFoundException()
        }

        return event
    }

    @Post()
    @UseGuards(AuthGuardJwt)
    @UseInterceptors(ClassSerializerInterceptor)
    async create(
        @Body() input: CreateEventDto,
        @CurrentUser() user: User
    ) {
        return await this.eventsService.createEvent(input, user)
    }

    @Patch(':id')
    @UseGuards(AuthGuardJwt)
    @UseInterceptors(ClassSerializerInterceptor)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() input: UpdateEventDto,
        @CurrentUser() user: User
    ) {
        const event = await this.eventsService.getEvent(id)

        if(!event) {
            throw new NotFoundException()
        }

        if(event.organizerId !== user.id) {
            throw new ForbiddenException(null, 'You are not authorized to change this event')
        }

        return await this.eventsService.updateEvent(event, input)
    }

    @Delete(':id')
    @UseGuards(AuthGuardJwt)
    @HttpCode(204)
    async remove(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: User
    ) {
        const event = await this.eventsService.getEvent(id)

        if(!event) {
            throw new NotFoundException()
        }

        if(event.organizerId !== user.id) {
            throw new ForbiddenException(null, 'You are not authorized to remove this event')
        }

        return await this.eventsService.deleteEvent(id)
    }
}
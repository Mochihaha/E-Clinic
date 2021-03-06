import {Bar} from 'vue-chartjs'
import database from '../../firebase'
import { mapGetters} from "vuex";
export default{
    extends:Bar,
    data: () => ({
        chartdata: {
          labels:[
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
          datasets: [
          ]
          
        },
        options: {
            title:{
                display:true,
                text:'Monthly Average Rating Score',
                fontColor:'Black',
                fontSize:15,
            },
            responsive: true,
            maintainAspectRatio: false,
            // layout:{
            //     padding:{
            //         left: 5,
            //         right: 5,
            //         top: 0,
            //         bottom: 5
            //     }
            // },
            scales:{
                yAxes:[{
                    ticks:{
                        min:0,
                        max: 5
                    }

                }]
            }
        }
      }),
      computed: {
        ...mapGetters(["getUser"])
      },

    methods:{
        getRandomColor: function() {
            var letters = '0123456789ABCDEF'.split('');
            var color = '#';
            for (var i = 0; i < 6; i++ ) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        },
    
        fetchData : function(){
            let x = this.getUser.displayName
            let doctors = {}
            database.collection('doctors').where("clinic", "==", x).get().then((snapshot) => {
                snapshot.forEach((doc) => {
                    let id = doc.id
                    doctors[id] = doc.data().name
                })
            })
            database.collection('consultslots')
            .where("clinic", "==", x)
            .where("patient", "!=", null)
            .get()
            .then((snapshot)=>{
                let item = {}
                let doctor_list = []
                let patient_list = []
                snapshot.forEach((doc) => {
                    item = doc.data()
                    let doctor = item.doctor
                    let month = item.date.toDate().getMonth()
                    if (doctor_list.includes(doctor)) {
                        let index = doctor_list.indexOf(doctor)
                        patient_list[index][month] += 1
                        this.chartdata.datasets[index].data[month] = 
                        (this.chartdata.datasets[index].data[month] * (patient_list[index][month] - 1) + item.rating)/patient_list[index][month]
                    } else {
                        let d = {
                            label: doctors[doctor],
                            data:[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            borderWidth:0.5,
                            //borderColor: this.getRandomColor(),
                            backgroundColor: this.getRandomColor(),
                            fill:false
                        }
                        let count = this.chartdata.datasets.length
                        this.chartdata.datasets.push(d)
                        this.chartdata.datasets[count].data[month] = item.rating
                        doctor_list.push(doctor)
                        patient_list.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
                        patient_list[patient_list.length - 1][month] = 1
                    }
                })
                let total = {
                    label: "Overall",
                    data:[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    borderWidth:0.5,
                    //borderColor:"black",
                    backgroundColor: "rgb(0, 114, 180)",
                    fill:false
                }
                let index = this.chartdata.datasets.length
                this.chartdata.datasets.push(total)
                for (var i = 0; i < 12; i++) {
                    let total_patients = 0
                    for (var j = 0; j < index; j++) {
                        let patient_count = patient_list[j][i]
                        this.chartdata.datasets[index].data[i] += this.chartdata.datasets[j].data[i] * patient_count
                        total_patients += patient_count
                    }
                    if (total_patients != 0) {
                        this.chartdata.datasets[index].data[i] = this.chartdata.datasets[index].data[i]/total_patients
                    }
                }
                this.renderChart(this.chartdata,this.options)
            })
        }
    },
     mounted(){
        this.fetchData()
        
        
     }

    
    
    
}
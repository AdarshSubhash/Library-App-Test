import React from 'react';
import { StyleSheet, Text, View,TouchableOpacity,
    Image,TextInput,Alert,KeyboardAvoidingView,ToastAndroid } from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import firebase from 'firebase';
import db from '../config';
export default class Transactionscreen extends React.Component{
    constructor(){
        super();
        this.state={
            hasCameraPermissions:null,
            scan:false,
            scandata:'',
            butttonState:'normal',
            scanbookid:'',
            scanstudentid:'',
            transactionmessage:'',
        };

    }
  getCameraPermissions=async(id)=>{
      const {status}=await Permissions.askAsync(Permissions.CAMERA)
      this.setState({
          hasCameraPermissions:status==="granted",
          scan:false,
          butttonState:id
      })
  }  
  handlebarcodescanner=async({type,data})=>{
      const {butttonState}=this.state
     if(butttonState=="bookid") {
this.setState({
scan:true,
scanbookid:data,
butttonState:'normal'
})
  }
  else if(butttonState=="studentid"){
    this.setState({
        scan:true,
        scanstudentid:data,
        butttonState:'normal'
        })
          }
        }
        handletransaction=async()=>{
           var transactiontype=await this.checkbookeligibility();
           if(!transactiontype){
Alert.alert("book does not exist in database")
this.setState({scanbookid:"",scanstudentid:""})

           } 
           else if(transactiontype==="issue"){
var studenteligible=await this.checkstudenteligibilitybookissue();
if(studenteligible){
this.initiatebookissue();
Alert.alert("book issued to student");
}
           }
           else{
               var studenteligible=await this.eligibilityforbookreturn();
               if(studenteligible){
this.initiatebookreturn();
Alert.alert("book is returned to the library")
               }
           }

}
checkbookeligibility=async()=>{
    const bookref=await db.collection("Book").where("bookid","==",this.state.scanbookid).get();
    var transactiontype="";
if(bookref.docs.length==0){
transactiontype=false;
}
else{
     bookref.docs.map((doc)=>{
         var book=doc.data();
         if(book.bookavailability){
transactiontype="issue";
         }
         else{
             transactiontype="return";
         }
     })
}
return transactiontype;
}

checkstudenteligibilitybookissue=async()=>{
    const studentref=await db.collection("Student").where("studentid","==",this.state.scanstudentid).get();
    var studenteligible="";
    if(studentref.docs.length===0){
this.setState({
    scanstudentid:"",
    scanbookid:""
})
studenteligible=false;
Alert.alert("student id does not exist in the database");
    }
    else{
        studentref.docs.map((doc)=>{
            var student=doc.data();
            if(student.numberofbooksissued<2){
studenteligible=true;
            }
            else{
                studenteligible=false;
                Alert.alert("student has already been issued two books");
                this.setState({
                    scanbookid:"",
                    scanstudentid:""
                });
            }
        })
    }
    return studenteligible;
}

eligibilityforbookreturn=async()=>{
    const transactionref=await db.collection("transactions").where("bookid","==",this.state.scanbookid).limit(1).get();
    var studenteligible="";
    transactionref.docs.map((doc)=>{
        var lastbooktransaction=doc.data();
        if(lastbooktransaction.studentid===this.state.scanstudentid){
            studenteligible=true;

        }
        else{
            studenteligible=false;
            Alert.alert("book was not issued by the same student");
            this.setState({
                scanstudentid:"",
                scanbookid:""
            })
        }
    })
    return studenteligible;
}

        initiatebookissue=async()=>{
db.collection("transactions").add({
 studentid:this.state.scanstudentid,
 bookid:this.state.scanbookid,
 date:firebase.firestore.Timestamp.now().toDate(),
 transactiontype:"issue"
})
db.collection("Book").doc(this.state.scanbookid).update({
    bookavailability:false
})
db.collection("Student").doc(this.state.scanstudentid).update({
    numberofbooksissued:firebase.firestore.FieldValue.increment(1)
})
Alert.alert("bookissued");
this.setState({
    scanstudentid:"",
    scanbookid:""
})
        }

      

        initiatebookreturn=async()=>{
            db.collection("transactions").add({
             studentid:this.state.scanstudentid,
             bookid:this.state.scanbookid,
             date:firebase.firestore.Timestamp.now().toDate(),
             transactiontype:"return"
            })
            db.collection("Book").doc(this.state.scanbookid).update({
                bookavailability:true
            })
            db.collection("Student").doc(this.state.scanstudentid).update({
                numberofbooksissued:firebase.firestore.FieldValue.increment(-1)
            })
            Alert.alert("bookreturned");
            this.setState({
                scanstudentid:"",
                scanbookid:""
            })
                    }
            
render(){
    const hasCameraPermissions=this.state.hasCameraPermissions;
const scan=this.state.scan;
const butttonState=this.state.butttonState;
if(butttonState!=="normal"&& hasCameraPermissions){
return(
    <BarCodeScanner onBarCodeScanned={scan?undefined:this.handlebarcodescanner}
    style={StyleSheet.absoluteFillObject}/>
)
}
else if(butttonState==='normal'){


return(

<KeyboardAvoidingView style={styles.container} behaviour="padding"enabled>
    <View>
        <Image source={require('../assets/booklogo.jpg')}
        style={{width:100,height:100}}/>
        <Text style={{fontSize:23,textAlign:'center'}}>The Library App</Text>
        
        
    </View>
<View style={styles.inputView}>
    <TextInput style={styles.inputBox}
    placeholder="bookid" 
    onChangeText={text=>this.setState({
        scanbookid:text
    })}
    value={this.state.scanbookid}/>
 <TouchableOpacity style={styles.scanButton} onPress={()=>{
        this.getCameraPermissions("bookid");
    }}>
<Text style={styles.buttonText}>scan</Text>
    </TouchableOpacity>
    <TextInput style={styles.inputBox}
    placeholder="studentid" 
    onChangeText={text=>this.setState({
        scanstudentid:text
    })} 
    value={this.state.scanstudentid}/>
    <TouchableOpacity style={styles.scanButton} onPress={()=>{
        this.getCameraPermissions("studentid");
    }}>
<Text style={styles.buttonText}>scan</Text>
    </TouchableOpacity>
</View>
   <TouchableOpacity style={styles.submitbutton} onPress={async()=>{var transactionmessage=this.handletransaction();
   this.setState({
scanbookid:'',
scanstudentid:'',
   })
}}>
       <Text style={styles.submitbuttontext}>Submit</Text>
   </TouchableOpacity>

   </KeyboardAvoidingView>


)
}
}


}
const styles = StyleSheet.create({ container: 
    { flex: 1,
         justifyContent: 'center', 
         alignItems: 'center' },
          displayText:{ fontSize: 15,
             textDecorationLine: 'underline' }, 
             scanButton:{ backgroundColor: '#2196F3',
              padding: 10, 
              margin: 10 },
               buttonText:{ fontSize: 15,
                 textAlign: 'center',
                  marginTop: 10 },
                   inputView:{ flexDirection: 'row', margin: 10 },
                    inputBox:{ width: 100,
                         height: 40,
                          borderWidth: 1.5, 
                          borderRightWidth: 0, 
                          fontSize: 20,margin:20 }, 
                          scanButton:{ backgroundColor: '#66BB6A', 
                          width: 50, 
                          borderWidth: 1.5,
                           borderLeftWidth: 0 } ,
                           submitbutton:{
                               backgroundColor:'red',width:100,height:50,

                           },
                           submitbuttontext:{
                               textAlign:'center',
                               fontSize:22,
                               fontWeight:'bold',
                               color:'white'
                           }
                        });
